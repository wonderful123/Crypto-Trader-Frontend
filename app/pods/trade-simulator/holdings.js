import EmberObject from '@ember/object';
import TradeHistory from './trade-history';

export default EmberObject.extend({
  tradeHistory: TradeHistory.create(), // object that records buys and sells
  holdings: null, // array that holds current coins

  profit: 0,

  reset() {
    this.set('holdings', []);
    this.set('profit', 0);
    this.set('value', 0);
    this.set('tradeHistory.trades', []); // reset trade history
  },

  add(coinName, price, amount, buyDay, buyValue) {
    let holdings = this.get('holdings');
    holdings.pushObject({
      name: coinName,
      buyValue: buyValue,
      buyPrice: price,
      amount: amount,
      buyDay: buyDay,
    });
  },

  sell(coin, amount, sellDay, position, priceData) {
    let holdings = this.get('holdings');
    let holding = holdings.find(h => h.name === coin.name);

    let coinData = priceData.find(c => c.name === coin.name)
    let sellPrice = coinData.values[position].close;
    let sellValue = holding.amount * sellPrice;

    let profit = this.get('profit');
    this.set('profit', profit + sellValue - holding.buyValue);

    this.set('holdings', holdings.filter(h => h.name !== coin.name)); // remove holding

    let trade = { // record the trade
      coin: coin.name,
      buyPrice: coin.buyPrice,
      sellPrice: sellPrice,
      amount: coin.amount,
      buyDay: coin.buyDay,
      sellDay: sellDay,
      buyValue: coin.buyValue,
      sellValue: sellValue,
    }
    this.tradeHistory.add(trade);
  },

  updateFinalHoldingsValue(remainingCapital, priceData) {
    let holdings = this.get('holdings');

    holdings.forEach(coin => {
      let coinData = priceData.find(c => c.name === coin.name)
      let lastPosition = coinData.values.length - 1;
      let price = coinData.values[lastPosition].close;
      coin.finalPrice = price;
      coin.finalValue = price * coin.amount;
      coin.change = price / coin.buyPrice * 100 - 100;
    })
    let totalHoldingsValue = holdings.reduce((total, coin) => (total + coin.finalValue), 0);
    this.set('value', totalHoldingsValue + remainingCapital);
    this.set('remainingCapital', remainingCapital);

    return totalHoldingsValue + remainingCapital;
  },
});
