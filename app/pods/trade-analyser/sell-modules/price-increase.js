import EmberObject from '@ember/object';

const options = {
  increaseMultiple: {
    label: "Increase multiple",
    id: "increaseMultiple",
    component: "trade-simulator/module-options/input",
    value: "5"
  },
};

export default EmberObject.extend({
  name: "Price increase",
  description: "Sells coin when it reaches a increase multiple.",
  options: options,

  checkSellCondition(coin, position, priceData) {
    let increaseMultiple = this.options.increaseMultiple.value;

    let coinData = priceData.find(c => c.name === coin.name)
    let currentPrice = coinData.series[position][1];

    if (currentPrice > coin.buyPrice * increaseMultiple)
      return true; // sell it
    else
      return false; // don't sell
  }
});
