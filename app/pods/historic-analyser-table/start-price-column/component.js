import Component from '@ember/component';
import { computed, defineProperty } from '@ember/object';

export default Component.extend({
  init() {
    // Define computed properties in init so variable dependency key can be used.
    this._super(...arguments);
    let record = "record." + this.get('column.propertyName');
    defineProperty(this, 'value', computed(`${record}`, () => this.get(`${record}`)));

    let history = this.get("record.previousHistorySeries");
    let min = history.min;
    let max = history.max;
    let percentile = history.lastClosePercentile;
    let marketCap = this.get("record.startDate").marketCap;

    defineProperty(this, 'max', computed('previousHistorySeries', () => max));
    defineProperty(this, 'min', computed('previousHistorySeries', () => min));
    defineProperty(this, 'percentile', computed('previousHistorySeries', () => percentile));
    defineProperty(this, 'marketCap', computed('startDate', () => marketCap));
  },
  isDefined: computed('value', function() {
    return (this.get('value')) ? true : false;
  })
});
