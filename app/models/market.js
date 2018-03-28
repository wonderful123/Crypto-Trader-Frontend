import DS from 'ember-data';

export default DS.Model.extend({
  marketName: DS.attr('string'),
  high: DS.attr('number'),
  low: DS.attr('number'),
  volume: DS.attr('number'),
  last: DS.attr('number'),
  baseVolume: DS.attr('number'),
  bid: DS.attr('number'),
  ask: DS.attr('number'),
  openBuyOrders: DS.attr('number'),
  openSellOrders: DS.attr('number'),
  prevDay: DS.attr('number'),
  created: DS.attr('date'),
  marketCurrencyName: DS.attr('string'),
  change: DS.attr('number'),
  platform: DS.belongsTo('platform', { async: true })
});
