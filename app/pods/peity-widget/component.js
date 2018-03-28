import Component from '@ember/component';
// import { computed } from '@ember/object';
//
// import ajax from 'ic-ajax';
// import DS from 'ember-data';
// import ENV from '../../config/environment';
//
// const peityOptions = {
//   height: '100%',
//   width: '100%',
//   fill: "#E9F4F5",
//   strokeWidth:3,
//   stroke: "#CAECFF"
// }

export default Component.extend({
  // type: 'line',
  //
  // didInsertElement: function() {
  //   this.$('.peity-chart').peity(this.get('type'), peityOptions);
  // },
  //
  // didUpdate: function() {
  //   // call change() to rerender peity
  //   this.$('.peity-chart').change();
  // },
  //
  // chartData: computed(function() {
  //   let marketName = this.get('market.marketName');
  //   let platform = this.get('apiName')
  //   let timeFrame = '24h';
  //   let groupBy = '30m';
  //   let query = 'SELECT mean("last") AS "mean_last" FROM "markets"."autogen"."price" WHERE time > now() - ' +timeFrame+ ' AND "market_name"=\'' +marketName+ '\' AND "platform"=\'' +platform+ '\' GROUP BY time(' +groupBy+ ') fill(previous)';
  //   query = escape(query); //escape characters for query
  //   let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;
  //
  //   let array = [];
  //   let arrayPromise = ajax({url: url}).then((request) => {
  //     for (var i = 0; i < request.results[0].series[0].values.length; i++) {
  //       var value = request.results[0].series[0].values[i][1];
  //       if (value != null) {
  //         array.push(value);
  //       }
  //     }
  //     // normalize values
  //     var max = Math.max(...array);
  //     var min = Math.min(...array);
  //     for (i = 0; i < array.length; i++) {
  //       array[i] = (array[i]-min)/(max-min);
  //     }
  //     return array;
  //   })
  //
  //   return DS.PromiseArray.create({
  //     promise: arrayPromise
  //   });
  // }).property('market')

});
