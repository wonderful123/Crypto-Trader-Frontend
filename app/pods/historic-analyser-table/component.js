import Component from '@ember/component';
import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import { computed, observer, getProperties } from '@ember/object';

export default Component.extend({
  influxdb: service(),
  realtimeCalculationsToggled: false, // set default

  init() {
    this._super(...arguments);

    this.filterOptions = { shouldUpdate: false };
    this.sortingValues = { startDate: "startDate.marketCap", endDate: "endDate.marketCap" }; // default sorting values for start and end date columns

    this.tableData = [];
    this.pageSize = 20;
    this.customMessages = {
      "searchLabel": "Filter",
      "searchPlaceholder": "Filter",
      "tableSummary": "Showing %@ - %@ of %@",
      "noDataToShow": "No matching markets."
    };
  },

  actions: {
    setSortBy(column, selection) {
      this.set(`sortingValues.${column}`, `${column}.${selection}`);
    },
    
    setFilters(filterOptions) {
      this.set('filterOptions', filterOptions);
      this.get('filterOptions.shouldUpdate') ? this.set('filterOptions.shouldUpdate', false) : this.set('filterOptions.shouldUpdate', true); // toggle flag so filtered observer fires
    },

    calculate() { // table calculation action trigger
      this.set('calculated', false); // flag to be calculated
      // fire observer by toggling equivalent false values (false <=> 0)
      this.get('realtimeCalculationsToggled') === false ? this.set('realtimeCalculationsToggled', 0) : this.set('realtimeCalculationsToggled', false);
    },
  },

  // Filtered data is used for the table so we can do custom filtering
  filteredData: computed('tableData.[]', 'filterOptions.shouldUpdate', function() {
    let filterData = this.get('tableData');
    let filterOptions = this.get('filterOptions');
    if (filterOptions.startDateMarketCapMinimum)
      filterData = filterData.filter((coin) => (coin.startDate.marketCap > filterOptions.startDateMarketCapMinimum))
    if (filterOptions.startDateMarketCapMaximum)
      filterData = filterData.filter((coin) => (coin.startDate.marketCap < filterOptions.startDateMarketCapMaximum))
    if (filterOptions.endDateMarketCapMinimum)
      filterData = filterData.filter((coin) => (coin.endDate.marketCap > filterOptions.endDateMarketCapMinimum))
    if (filterOptions.endDateMarketCapMaximum)
      filterData = filterData.filter((coin) => (coin.endDate.marketCap < filterOptions.endDateMarketCapMaximum))
    if (filterOptions.hideNewMarkets === true) {
      filterData = filterData.filter((coin) => {
        return (coin.startDate.close !== null)
      })
    }
    return filterData;
  }),

  // Observer recalculated the columns and tableData when options are selected unless realtime calculations is off.
  _selectionObserver: observer('startDate', 'endDate', 'previousTimeframe', 'platform', 'baseCurrency', 'realtimeCalculationsToggled', function() {
    let p = this.getProperties('startDate', 'endDate', 'platform', 'baseCurrency', 'realtimeCalculationsToggled', 'calculated', 'previousTimeframe');
    if (p.startDate && p.endDate) { // check dates have been selected
      if (p.realtimeCalculationsToggled || p.calculated === false) { // if realtime toggled or not calculated yet, then calculate
        if (p.startDate >= p.endDate) this.toast.warning('', 'End date must be greater than starting date', { timeOut: 2000, closeButton: true, hideDuration: 500 });
        else {
          let influxdb = this.get('influxdb');
          var data = [influxdb.getCoinNames(p.platform, p.baseCurrency)]; // get coin names for platform and currency
          data.push(influxdb.getData(p.startDate, p.platform, p.baseCurrency)); // get data for start date
          data.push(influxdb.getData(p.endDate, p.platform, p.baseCurrency)); // get data for end date
          data.push(influxdb.getSeries({startDate: p.startDate, previousTimeframe: p.previousTimeframe.code, platform: p.platform, baseCurrency: p.baseCurrency})); // first chart
          data.push(influxdb.getSeries({startDate: p.startDate, endDate: p.endDate, platform: p.platform, baseCurrency: p.baseCurrency})); // second chart, will use start and end date.
          data.push(this.get('model.coins')); // has coin supply to work out basic marketcap
          _buildTableData(data).then(data => ( this.set('tableData', data )) );
          this.set('calculated', true); // set flag that calculation is done
        }
      }
    }
  }),

//TODO: column rerender is causing slow downs
  columns: computed('startDate', 'endDate', 'previousTimeframe', 'sortingValues.{startDate,endDate}', function() {
    let p = getProperties(this, 'startDate', 'endDate', 'previousTimeframe', 'platform', 'baseCurrency', 'sortingValues');
    // Build titles
    let startDateTitle = p.startDate ? p.startDate.toLocaleDateString() : "Start date";
    let endDateTitle = p.endDate ? p.endDate.toLocaleDateString() : "End date";
    let timeDiff = Math.abs(p.startDate - p.endDate);
    let days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    let changeTitle = (p.startDate && p.endDate) ? `Change (+${days} days)` : "Change";
    let previousHistoryChartTitle = (p.startDate && p.endDate) ? `Previous ${p.previousTimeframe.name}` : "Previous";
    let historyChartTitle = (p.startDate && p.endDate) ? `Selected range (${days} days)` : "Start-End";

    let columns = [{
        propertyName: 'coin',
        title: 'Coin',
        component: 'historic-analyser-table/coin-name-column'
      }, {
        propertyName: 'previousHistorySeries',
        title: previousHistoryChartTitle,
        className: "market-table peitychart",
        component: 'historic-analyser-table/sparkline-column'
      }, {
        propertyName: 'startDate.close',
        sortedBy: p.sortingValues.startDate,
        componentForSortCell: 'historic-analyser-table/sort-cell-with-selector',
        title: startDateTitle,
        className: "text-right",
        component: 'historic-analyser-table/start-price-column'
      }, {
        propertyName: 'endDate.close',
        sortedBy: p.sortingValues.endDate,
        componentForSortCell: 'historic-analyser-table/sort-cell-with-selector',
        title: endDateTitle,
        className: "text-right",
        component: 'historic-analyser-table/end-price-column'
      }, {
        propertyName: 'historySeries',
        title: historyChartTitle,
        className: "market-table peitychart",
        component: 'historic-analyser-table/sparkline-column'
      }, {
        propertyName: 'endDate.change',
        title: changeTitle,
        component: 'historic-analyser-table/change-column',
        className: "text-right"
      }];
    return columns;
  }),
});

function _buildTableData(dataPromises) {
  var tempTableData = {};
  return Promise.all(dataPromises).then(array => {
    array[0].forEach(coinName => ( // First array is just a list of coin names
      tempTableData[coinName] =
        { startDate: { close: null }, // Set null values for each date and coin
          endDate: { close: null, change: null },
          previousHistorySeries: {},
          historySeries: {}
        }
      )
    )

    // Set all start date prices
    array[1].forEach(coin => (tempTableData[coin.name].startDate.close = coin.close));

    // Set end date prices and change value if start price was found.
    array[2].forEach(coin => {
      tempTableData[coin.name].endDate.close = coin.close;
      if (tempTableData[coin.name].startDate.close) // if startDate close defined then calculate change
        tempTableData[coin.name].endDate.change = coin.close / tempTableData[coin.name].startDate.close * 100 - 100;
    })

    array[3].forEach(coin => { // first chart series
      tempTableData[coin.name].previousHistorySeries.data = coin.series;
      tempTableData[coin.name].previousHistorySeries.min = coin.min;
      tempTableData[coin.name].previousHistorySeries.max = coin.max;
      tempTableData[coin.name].previousHistorySeries.lastClosePercentile = coin.lastClosePercentile;
      tempTableData[coin.name].startDate.percentile = coin.lastClosePercentile; // duplicate to make it easier to select sorting column in custom sort cell component
    })

    array[4].forEach(coin => { // second chart series
      tempTableData[coin.name].historySeries.data = coin.series;
      tempTableData[coin.name].historySeries.min = coin.min;
      tempTableData[coin.name].historySeries.max = coin.max;
      tempTableData[coin.name].historySeries.lastClosePercentile = coin.lastClosePercentile;
      tempTableData[coin.name].endDate.percentile = coin.lastClosePercentile; // duplicate to make it easier to select sorting column in custom sort cell component
    })

    array[5].forEach(coin => {
      if (tempTableData.hasOwnProperty(coin.data.symbol)) { // only add coins that are already in table
        tempTableData[coin.data.symbol].supply = coin.data.supply;
        tempTableData[coin.data.symbol].startDate.marketCap = coin.data.supply * tempTableData[coin.data.symbol].startDate.close; // startDate marketcap
        tempTableData[coin.data.symbol].endDate.marketCap = coin.data.supply * tempTableData[coin.data.symbol].endDate.close; // startDate marketcap
        tempTableData[coin.data.symbol].fullName = coin.data.name;
      }
    })

    // flatten object into array usable by table
    return Object.keys(tempTableData).map(coinName => {
      let data = tempTableData[coinName];
      return Object.assign(data, {coin: coinName})
    });
  })
}
