import Component from '@ember/component';
import { observer, set, get } from '@ember/object';
import { inject as service } from '@ember/service';

const customMessages = {
  "searchLabel": "Filter",
  "searchPlaceholder": "Filter",
  "tableSummary": "Showing %@ - %@ of %@",
  "noDataToShow": "No matching markets."
};

export default Component.extend({
  store: service(),

  pageSize: 20,
  columns: null,
  tableData: null,
  customMessages: customMessages,

  willDestroyElement() { // remove actioncable subscriptions
    this.get('_actioncableSubscriptions').forEach(subscription => {
      subscription.unsubscribe();
    })
  },

  _marketIndexLookupTable: null, // so websocket can look up which array row to update
  _actioncableSubscriptions: null, // tracks subscriptions so they can be removed when columns change

  // Observers set the columns and tableData when new platforms are selected

  _tableColumns: observer('platformIds', function() {
    let platformIds = this.get('platformIds');
    if (platformIds.length > 1) { // only build columns if there are 2 or more selected
      let platforms = [];
      platformIds.forEach(platformId => {
        let platform = this.get('store').peekRecord('platform', platformId);
        let platformObj = {name: platform.get('name'), apiName: platform.get('apiName')};
        platforms.pushObject(platformObj);
      });
      this.set('columns', buildColumns(platforms));
    } else {
      this.set('columns', []);
      this.set('tableData', []);
    }
  }),

  _tableData: observer('platformIds', function() {
    let platformIds = this.get('platformIds');

    // Reset actioncable subscriptions
    this.get('_actioncableSubscriptions').forEach(subscription => {
      subscription.unsubscribe();
    })
    this.set('_actioncableSubscriptions', []);

    // only calculate if there are 2 or more platforms
    if (platformIds.length > 1) {
      let platforms = [];
      // Get each platform
      platformIds.forEach(platformId => {
        let platform = get(this, 'store').peekRecord('platform', platformId);
        platforms.push(platform);
      });
      let builtTableData = buildTableData.apply(this, platforms);
      let _marketIndexLookupTable = buildMarketIndexLookupTable(builtTableData);
      set(this, '_marketIndexLookupTable', _marketIndexLookupTable);
      set(this, 'tableData', builtTableData);

      // create actioncable subscriptions
      platforms.forEach(platform => {
        let apiName = platform.get('apiName');
        let subscription = this.get('actioncable').subscribe(apiName, {
          received: (message) => {
            //Insert price into tableData
            if (message.market_name in _marketIndexLookupTable) {
              let index = _marketIndexLookupTable[message.market_name];
              // set updated values
              let data = this.get('tableData').objectAt(index);
              set(data.values, `${apiName}`, parseFloat(message.values.last));
              // calculate max/min/spread
              let values = Object.values(builtTableData[index].values);
              let max = Math.max(...values), min = Math.min(...values);
              let spread = (max/min)*100-100;
              set(data, 'min', min);
              set(data, 'max', max);
              set(data, 'spread', spread);
            }
          }
        });
        // track subscription for later removal
        this._actioncableSubscriptions.pushObject(subscription);
      })
    }
  }),
});

function buildColumns(platforms) {
  // Defines columns as table of column objects and builds a column for each platform
  let columns = [];
  platforms.forEach(platform => {
    let platformColumn = {
      title: platform.name,
      propertyName: `values.${platform.apiName}`,
      className: "text-right",
      component: 'platform-spread-table/price-column' };
    columns.push(platformColumn);
  })
  // Add first column
  columns.unshift({
    propertyName: 'marketName',
    title: 'Market'
  });
  // Add last column
  columns.push({
    propertyName: "spread",
    title: "Spread %",
    className: "text-right",
    sortDirection: "desc",
    sortPrecedence: 1,
    component: "platform-spread-table/spread-column"
  });
  return columns;
}

function buildMarketIndexLookupTable(tableData) {
  // Build marketName lookup table for dataTable rows for websocket updates
  let marketIndexLookupTable = {};
  tableData.forEach((market, index) => {
    marketIndexLookupTable[market.marketName] = index;
  });
  return marketIndexLookupTable;
}

function buildTableData() {
  // Find all matching markets across all the platforms
  let lookupTable = {}; // temp table to keep track of which platform matches are found
  for (var i = 1; i < arguments.length; i++) {
    let platform1 = arguments[i-1];
    for (var x = 0; x < arguments.length-i; x++) {
      let platform2 = arguments[i+x];
      platform1.get('markets').forEach(market1 => {
        let market1Name = market1.get('marketName');
        let market2 = platform2.get('markets').find(market2 => market1Name === market2.get('marketName'));
        if (market2) { // if matching market found
          if (!lookupTable[market1Name]) // if marketName not defined then initialize it
            lookupTable[market1Name] = {};
          lookupTable[market1Name][platform1.get('apiName')] = market1;
          lookupTable[market1Name][platform2.get('apiName')] = market2;
        }
      })
    }
  }
  // Create a dataTable using the lookupTable and calculate max/min/spread values
  let tableData = [];
  Object.entries(lookupTable).forEach(([market, markets]) => {
    var obj = {marketName: market, values:{}}
    var min = Infinity, max = -Infinity;
    for (var i = 0; i < arguments.length; i++) {
      let platform = arguments[i];
      let platformName = platform.get('apiName');
      if (markets[platformName] !== undefined) {
        let price = markets[platformName].get('last');
        if (price < min) min = price;
        if (price > max) max = price;
        obj.values[platformName] = price;
      }
    }
    obj.max = max;
    obj.min = min;
    obj.spread = (max/min)*100-100;
    tableData.push(obj);
  })
  return tableData;
}
