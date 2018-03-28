import Component from '@ember/component';
import { computed, defineProperty } from '@ember/object';

export default Component.extend({
  init() {
    // Define computed properties in init so variable dependency key can be used.
    this._super(...arguments);
    let record = "record." + this.get('column.propertyName');
    defineProperty(this, 'value', computed(`${record}`, () => this.get(`${record}`)));

    let history = this.get("record.historySeries");
    let min = history.min;
    let max = history.max;
    let percentile = history.lastClosePercentile;
    let marketCap = this.get("record.endDate").marketCap;

    defineProperty(this, 'max', computed('historySeries', () => max));
    defineProperty(this, 'min', computed('historySeries', () => min));
    defineProperty(this, 'percentile', computed('historySeries', () => percentile));
    defineProperty(this, 'marketCap', computed('startDate', () => marketCap));
  },
  
  isDefined: computed('value', function() {
    return (this.get('value')) ? true : false;
  })
});
