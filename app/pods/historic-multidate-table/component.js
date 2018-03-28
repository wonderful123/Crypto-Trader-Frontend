import Component from '@ember/component';
import { set, observer } from '@ember/object';

import { Promise } from 'rsvp';
import ajax from 'ic-ajax';
import ENV from '../../config/environment';

const columns = [{
  propertyName: 'coin',
  title: 'Coin'
}];

const customMessages = {
  "searchLabel": "Filter",
  "searchPlaceholder": "Filter",
  "tableSummary": "Showing %@ - %@ of %@",
  "noDataToShow": "No matching markets."
};

export default Component.extend({
  groupedHeaders: null,
  columns: columns,
  tableData: null,
  pageSize: 20,
  customMessages: customMessages,

  realtimeCalculationsToggled: true, // set default on

  actions: {
    calculate: function() {
      set(this, 'calculated', false); // flag to be calculated
      // fire observer by toggled equivalent false values (false <=> 0)
      this.get('realtimeCalculationsToggled') === false ? set(this, 'realtimeCalculationsToggled', 0) : set(this, 'realtimeCalculationsToggled', false);
    }
  },

  // Observer sets the columns and tableData when options are selected
  _selectedPlatformCurrencyObserver: observer('realtimeCalculationsToggled', 'dates', 'platform', 'baseCurrency', 'calculations', function() {
    if (this.get('realtimeCalculationsToggled') || this.get('calculated') === false) { // if realtime toggled or not calculated yet, then calculate
      if (this.get('dates').length > 0) { // only calculate if dates are selected.
        let builtTableData = buildTableData(this.get('dates'), this.get('platform'), this.get('baseCurrency'));
        set(this, 'tableData', []);
        builtTableData.then(data => ( set(this, 'tableData', data )));
        let columns = buildColumns(this.get('dates'), this.get('calculations'));
        set(this, 'columns', columns.columns);
        set(this, 'groupedHeaders', columns.groupedHeaders);
      } else { // no dates, then reset the table
        set(this, 'columns', [{propertyName: 'coin', title: 'Coin'}]);
        set(this, 'groupedHeaders', []);
        set(this, 'tableData', []);
      }
      set(this, 'calculated', true); // set flag that calculation is done
    }
  }),
});

function buildColumns(dates, calculations) {
  // Defines columns as table of column objects and builds a column for each date and calculation
  var columns = [];
  var groupedHeaders = [[{ title: dates[0].toLocaleDateString(), colspan: 2 }]];
  for (var i = 1; i < dates.length; i++) {
    // Create grouped header
    let timeDiff = Math.abs(dates[i-1] - dates[i]);
    let days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    let header = { title: `${dates[i].toLocaleDateString()} (+${days} days)`, colspan: calculations.length }
    groupedHeaders[0].pushObject(header);

    // Create a column for each calculation
    for (var x = 0; x < calculations.length; x++) {
      var propertyName, title, component;
      switch(calculations[x]) {
        case 'Closing price':
          propertyName = `date${i}.close`;
          title = "Price";
          component = 'historic-multidate-table/price-column';
          break;
        case 'Change from first date':
          propertyName = `date${i}.changeFromFirstDate`;
          title = "Change";
          component = 'historic-multidate-table/change-column';
          break;
        case 'Change from previous date':
          propertyName = `date${i}.changeFromPreviousDate`;
          title = "Prev";
          component = 'historic-multidate-table/change-column';
          break;
      }
      let dataColumn = {
        title: title,
        propertyName: propertyName,
        className: "text-right",
        component: component };
      columns.pushObject(dataColumn);
    }
  }
  // Second column is just the price
  columns.unshift({
    title: "Price",
    propertyName: 'date0.close',
    className: "text-right",
    component: 'historic-multidate-table/price-column'
  });
  // Add first column
  columns.unshift({
    propertyName: 'coin',
    title: 'Coin'
  });
  return {columns: columns, groupedHeaders: groupedHeaders};
}

function buildTableData(dates, platform, baseCurrency) {
  // get all coin names as first array
  var dataPromises = [getInfluxCoinNames(platform, baseCurrency)];
  // Request date data for date
  dates.forEach(date => {
    dataPromises.push(getInfluxData(date, platform, baseCurrency));
  })
  var tempTableData = {};
  return Promise.all(dataPromises).then(array => {
    // First array is just a list of coin names
    array[0].forEach(coinName => (tempTableData[coinName] = {})) // Use the first array to add all the coin names and data holder
    array.forEach((a, index) => { // Set undefined values for each date and coin
      array[0].forEach(coinName => (tempTableData[coinName][`date${index}`] = { close: null, changeFromPreviousDate: null, changeFromFirstDate: null}));
    })

    // add each date to the matching coin
    for (var index = 0; index < array.length-1; index++) {
      array[index+1].forEach(coin => {
        tempTableData[coin.name][`date${index}`].close = coin.close ;

        // Calculate changes
        if (index !== 0 && tempTableData[coin.name][`date${index-1}`].close) { // skip change calcuations for first column or if the previous close isn't defined
          tempTableData[coin.name][`date${index}`]['changeFromPreviousDate'] = coin.close / tempTableData[coin.name][`date${index-1}`].close * 100 - 100;

          if (tempTableData[coin.name]['date0'].close) { // if the first date is defined then calculate the change from there
            tempTableData[coin.name][`date${index}`]['changeFromFirstDate'] = coin.close / tempTableData[coin.name]['date0'].close * 100 - 100;
          } else { // otherwise find the first date
            for (let x = index-1; x > 0; x--) { // search back until last date.
              if (!tempTableData[coin.name][`date${x}`]['changeFromFirstDate']) {// if change not defined then it must be the first
                tempTableData[coin.name][`date${index}`]['changeFromFirstDate'] = coin.close / tempTableData[coin.name][`date${x}`].close * 100 - 100;
                break;
              }
            }
          }
        }
      })
    }
    // flatten object into array usable by table
    return Object.keys(tempTableData).map(coinName => {
      let dateData = tempTableData[coinName];
      return Object.assign(dateData, {coin: coinName})
    });
  })
}

function getInfluxData(date, platform, baseCurrency) {
  // Gets the closing price at specific date
  let timeDiff = Math.abs(date - Date.now());
  let days = Math.ceil(timeDiff / (1000 * 3600 * 24));
  let timeFrame = `${days}d`;
  let query = `SELECT last("close") FROM "cryptocompare"."autogen"."price" WHERE time < now() - ${timeFrame} AND "platform"='${platform}' AND "market_name"=~ /${baseCurrency}.*/ GROUP BY "market_name"`;
  query = escape(query); //escape characters for query
  let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;
  let promise = ajax({url: url}).then((request) => {
    let array = [];
    if (request.results[0].series) { // check request returned values
      for (var i = 0; i < request.results[0].series.length; i++) {
        var close = request.results[0].series[i].values[0][1];
        var market_name = request.results[0].series[i].tags.market_name;
        var coin = market_name.split("-")[1]; // Get second symbol of market_name
        if (coin != null && !array.includes(coin)) {
          array.pushObject({ name: coin, close: close });
        }
      }
    }
    return array;
  });
  return promise;
}

function getInfluxCoinNames(platform, baseCurrency) {
  let query = `SHOW TAG VALUES ON "cryptocompare" WITH KEY = "market_name" WHERE "platform" = '${platform}' AND "market_name" =~ /^${baseCurrency}.*/`;
  query = escape(query); //escape characters for query
  let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;
  let promise = ajax({url: url}).then(request => {
    let array = [];
    if (request.results[0].series) { // check request returned values
      for (var i = 0; i < request.results[0].series[0].values.length; i++) {
        var market_name = request.results[0].series[0].values[i][1];
        var coin = market_name.split("-")[1]; // Get second symbol of market_name
        if (coin != null && !array.includes(coin)) {
          array.pushObject(coin);
        }
      }
    }
    return array;
  });
  return promise;
}
