/*global anychart:true*/
import Component from '@ember/component';
import { computed, set } from '@ember/object';

export default Component.extend({
//  chart: undefined,

  nFormatter(num, digits) {
    var si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "k" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
  },

  anyChart: computed('redraw', function() {
    let self = this;
    let data = this.get('tradeData');

    let dataTable = anychart.data.table();
    dataTable.addData(data);

    let finalValues = dataTable.mapAs({ date: 0, value: 1 });

    // create stock chart
    this.chart = anychart.stock();

    // disable the grouping feature
    this.chart.grouping().enabled(false);

    // create first plot on the chart
    let plot = this.chart.plot(0);
    plot.xGrid().enabled(true);
    plot.yGrid().enabled(true);
    plot.xMinorGrid().enabled(true);
    plot.yMinorGrid().enabled(true);

    let finalValueSeries = plot.line(finalValues).stroke('#64b5f6');
    finalValueSeries.name('Final value');

    // create EMA indicators with period 20
    plot.ema(dataTable.mapAs({ value: 1 }), 20).series().stroke('#ffa000');

    //create scroller series with mapped data
    this.chart.scroller().line(finalValues);

    // get chart tooltip
    let tooltip = finalValueSeries.tooltip();

    // enable HTML for tooltips
    tooltip.useHtml(true);

    tooltip.format(function() {
      return "Final value: " + self.nFormatter(this.value, 2);
    });

    this.chart.title('Final holding value calculated for each starting date')

    // Format y axis labels
    var yLabels = this.chart.plot(0).yAxis(0).labels();
    yLabels.format(function() {
      return "$" + self.nFormatter(this.value, 2);
    });

    // Get xScale object
    var xScale = this.chart.xScale();
    var chartInst = this.chart;

    this.chart.listen('click', function(event) {
      clickHandler(event);
    });

    // Click event handler
    function clickHandler(event) {
        var x = event.offsetX;  // X click coordinate on plot

        var plotWidth = chartInst.plot(0).getPixelBounds().width;   // plot bounds related to chart container
        var plotLeftoffset = chartInst.plot(0).getPixelBounds().left;   // plot left margin

        // is click on data area
        if (x < plotLeftoffset || x > plotLeftoffset + plotWidth) {
            return;
        }

        //get date of click related to xScale
        var ratio = (x - plotLeftoffset) / plotWidth;
        var xDate = xScale.inverseTransform(ratio);

        //get data from clicked point
        var selectable = finalValues.createSelectable();
        var interval = chartInst.grouping().getCurrentDataInterval();
        selectable.selectAll(interval.unit, interval.count);
        var select = selectable.search(xDate, "nearest");

        //get point value
        var value = select.get('value');

        //get point date (in milliseconds)
        var key = select.getKey();

        //format date and parse to string
        var pointDate = new Date(key);
        set(self, 'selectedDate', pointDate);
        console.log('POINTDATE', pointDate)
        var pointDateString = String(String(pointDate.getDate() + '/' + String(pointDate.getMonth() + 1) + '/' + pointDate.getFullYear()));

        chartInst.title('(' + pointDateString + ') - Total value: $' + self.nFormatter(value, 2));
    }

    this.redraw = true;

    return this.chart;
  }),

  actions: {
    draw() {
      this.toggleProperty('redraw');
    }
  },

});
