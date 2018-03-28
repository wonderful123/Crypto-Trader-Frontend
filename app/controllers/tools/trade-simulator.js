import Controller from '@ember/controller';
import { computed } from '@ember/object';

const timeFrames = [
  { code: '3d', name: '3d'},
  { code: '1w', name: '1w'},
  { code: '2w', name: '2w'},
  { code: '4w', name: '1m'},
  { code: '12w', name: '3m'},
  { code: '25w', name: '6m'},
  { code: '52w', name: '1y'},
  { code: '104w', name: '2y'}
];

const previousTimeframeDefault = { code: '52w', name: '1y' };
const conversionCurrencyDefault = ["USD"];

export default Controller.extend({
  breadCrumb: "Trade Simulator",
  maxDate: Date.now(),

  platform: "Poloniex",
  baseCurrency: "USDT", // temp defaults for testing - remove commented this.set below

  timeFrames: timeFrames,

  // Selection defaults
  previousTimeframe: previousTimeframeDefault,
  conversionCurrency: conversionCurrencyDefault,

  platformBaseCurrencies: computed('platform', function() {
    //this.set('baseCurrency', "");
    return this.get('model').platformBaseCurrencyPairs[this.get('platform')];
  }),
});
