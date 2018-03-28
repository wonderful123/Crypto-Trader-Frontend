import Component from '@ember/component';
import { computed } from '@ember/object';

import ajax from 'ic-ajax';
import DS from 'ember-data';
import ENV from '../config/environment';

export default Component.extend({
  peityOptions: computed.oneWay('column.peityOptions'),
  type: 'line',
  didInsertElement: function() {
    this.$('.peity-chart').peity(this.get('type'), this.get('peityOptions'));
  },
  didUpdate: function() {
    this.$('.peity-chart').change(); // call change() to rerender peity
  },
  chartData: computed('peityOptions', function() {
    let marketName = this.get('record.marketName');
    let timeFrame = this.get('peityOptions.timeFrame');
    let groupBy = this.get('peityOptions.groupBy');
    let platform = this.get('peityOptions.apiName');
    let query = 'SELECT mean("last") AS "mean_last" FROM "markets"."autogen".' +platform+ ' WHERE time > now() - ' +timeFrame+ ' AND "market_name"=\'' +marketName+ '\' GROUP BY time(' +groupBy+ ') fill(previous)';
    query = escape(query); //format to escaped string
    let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;
    let array = [];

    let arrayPromise = ajax({url: url}).then((request) => {
      for (var i = 1; i < request.results[0].series[0].values.length; i++) {
        var value = request.results[0].series[0].values[i][1];
        if (value != null) {
          array.push(value);
        }
      }
      // normalize values
      var max = Math.max(...array);
      var min = Math.min(...array);
      for (i = 0; i < array.length; i++) {
        array[i] = (array[i]-min)/(max-min);
      }
      return array;
    })

    return DS.PromiseArray.create({
      promise: arrayPromise
    });
  })

});
