import Controller from '@ember/controller';
import { set, observer } from '@ember/object';

const calculationTypes = [
  'Closing price',
  'Change from first date',
  'Change from previous date'
];

const emptyArray = [];
const selectedCalculationsDefault = ['Closing price'];
const baseCurrencyDefault = ['USD'];
const platformDefault = ['CCCAGG'];

export default Controller.extend({
  breadCrumb: "Historic Multidate Analyser",
  maxDate: Date.now(),
  selectedDates: emptyArray,
  sortedDates: emptyArray,
  datesShortForm: emptyArray,

  updateDates: observer('selectedDates', function() {
    let sorted = this.get('selectedDates').sort((a, b) => (a.getTime() - b.getTime()));
    this.set('sortedDates', sorted);
    let shortDates = sorted.map(date => (date.toLocaleDateString()));
    this.set('datesShortForm', shortDates);
  }),

  calculationTypes: calculationTypes,
  selectedCalculations: selectedCalculationsDefault,
  baseCurrency: baseCurrencyDefault,
  platform: platformDefault,

  actions: {
    clearDates() { set(this, 'selectedDates', []) }
  }
});
