import Component from '@ember/component';
import { computed, defineProperty } from '@ember/object';

const options = {
  width: "200px",
  height: "70px",
  spotRadius: "2",
  defaultPixelsPerValue: '1',
  tooltipFormatter: function() {
    let data = arguments[2];
    let date = new Date(data.x);
    date = date.toLocaleDateString();
    let price = data.y;
    if (data.y === null)
      price = "No data"
    return `<strong>Date:</strong> ${date}<br><strong>Price:</strong> ${price}`;
  }
};

export default Component.extend({
  chartOptions: computed.oneWay('column.chartOptions'),
  type: 'line',
  options: options,

  init() {
    // Define computed properties in init so a variable dependency key can be used.
    this._super(...arguments);
    let record = "record." + this.get('column.propertyName');
    let min = this.get(`${record}.min`);
    let max = this.get(`${record}.max`);

    defineProperty(this, 'data', computed(`${record}.data`, () => (this.get(`${record}.data`))));
    defineProperty(this, 'max', computed(`${record}.max`, () => (max)));
    defineProperty(this, 'min', computed(`${record}.min`, () => (min)));
  }
});
