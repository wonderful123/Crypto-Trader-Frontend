import Component from '@ember/component';
import { defineProperty, computed } from '@ember/object';
import { inject as service } from '@ember/service';

const options = {
  width: 75,
  height: 20,
  spotRadius: 1,
  lineColor: "#0054a8",
  maxSpotColor: "#00ff00",
  minSpotColor: "#ff0000",
  defaultPixelsPerValue: '1',
  fillColor: null,
  lineWidth: 0.8,
  tooltipFormatter: function() {
    let data = arguments[2];
    let date = new Date(data.x);
    date = date.toLocaleString('en-AU', { month: "numeric", day:"numeric", hour12: true, hour: "numeric", minute: "numeric"});
    let price = data.y.toFixed(8);
    if (data.y === null)
      price = "No data"
    return `<strong>Date:</strong> ${date}<br><strong>Price:</strong> ${price}`;
  }
};

export default Component.extend({
  store: service(),

  type: 'line',
  options: options,

  init() {
    this._super(...arguments);
    let timeFrame = this.get('column.chartOptions.timeFrame');

    defineProperty(this, 'values', computed(`record.sparkline${timeFrame}`, function() {
      let values = this.get(`record.sparkline${timeFrame}`);
      return values;
    }));
  },

});
