import EmberObject, { computed } from '@ember/object';

export default EmberObject.extend({
  add(trade) {
    let trades = this.get('trades') || [];

    // include some extra details
    trade.profit = trade.sellValue - trade.buyValue;
    trade.daysHeld = trade.sellDay - trade.buyDay;
    trade.gain = trade.sellValue / trade.buyValue * 100 - 100;

    trades.pushObject(trade);
  },

  numberOfTrades: computed('trades.[]', function() {
    return this.get('trades').length;
  }),

  totalProfit: computed('trades.[]', function() {
    return this.get('trades').reduce((total, trade) => (total += trade.profit), 0);
  }),

  totalPurchased: computed('trades.[]', function() {
    return this.get('trades').reduce((total, trade) => (total += trade.buyValue), 0);
  }),
});
