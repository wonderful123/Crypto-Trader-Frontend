/*global anychart:true*/
import Component from '@ember/component';
import { computed } from '@ember/object';
import ajax from 'ic-ajax';
import DS from 'ember-data';
import ENV from '../../config/environment';

export default Component.extend({
  // chart instance
  chart: undefined,

  chartData: computed(function() {
    let marketName = this.get('model.market.marketName');
    let platform = this.get('model.platform.name').toLowerCase();
    let timeFrame = '3h';
    let groupBy = '1m';
    let query = 'SELECT max("last") AS "max_last", min("last") AS "min_last", first("last") AS "first_last", last("last") AS "last_last" FROM "markets"."autogen"."' + platform + '" WHERE time > now() - ' +timeFrame+ ' AND "market_name"=\'' +marketName+ '\' GROUP BY time(' +groupBy+ ') fill(previous)';
    query = escape(query); //format to escaped string
    let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;

    let arrayPromise = ajax({url: url}).then((request) => {
      return request.results[0].series[0].values;
    });

    return DS.PromiseArray.create({
      promise: arrayPromise
    });
  }),

  anyChart: computed(function () {
    let self = this;
    var data = this.get('chartData.content');
    console.log("data", data);
    //console.log(this.model.market.marketName);

    // create data table on loaded data
    let dataTable = anychart.data.table();
    dataTable.addData(data);

    // map loaded data for the ohlc series
    let mapping = dataTable.mapAs({'high': 1, 'low': 2, 'open': 3, 'close': 4});

    // create stock chart
    this.chart = anychart.stock();

    // create first plot on the chart
    let plot = this.chart.plot(0);
    plot.xGrid().enabled(true);
    plot.yGrid().enabled(true);
    plot.xMinorGrid().enabled(true);
    plot.yMinorGrid().enabled(true);

    // create EMA indicators with period 50
    plot.ema(dataTable.mapAs({'value': 4})).series().stroke('1.5 #455a64');

    let series = plot.candlestick(mapping).name(this.get('model.market.marketName'));
    series.legendItem().iconType('risingfalling');

    // create scroller series with mapped data
    this.chart.scroller().candlestick(mapping);

    // set chart selected date/time range
    //this.chart.selectRange(daysago, now);

    return {
      chart: this.chart,
      afterDraw: self.afterChartDraw
    };
  }),

  afterChartDraw: function(chart){
    // create range picker
    let rangePicker = anychart.ui.rangePicker();
    // init range picker
    rangePicker.render(chart);

    // create range selector
    let rangeSelector = anychart.ui.rangeSelector();
    // init range selector
    rangeSelector.render(chart);
  },
});
