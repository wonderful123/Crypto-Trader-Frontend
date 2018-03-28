import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

const customMessages = {
  "searchLabel": "Filter:",
  "searchPlaceholder": "Filter",
  "tableSummary": "Showing %@ - %@ of %@",
}

export default Component.extend({
  store: service(),
  influxdb: service(),

  didReceiveAttrs() {
    this._super(...arguments);

    // Get sparkline data for each column and match it to the model markets data
    this.get('tableColumns').forEach(column => {
      if (column.component === 'market-table/sparkline-column') {
        let query = {
          platform: this.get('model.apiName'),
          timeFrame: column.chartOptions.timeFrame,
          groupBy: column.chartOptions.groupBy,
        };
        this.get('store').query('sparkline', query)
          .then(sparklineData => {
            // Build sparkline data list so it's easy to access
            let sparklineList = {};
            sparklineData.forEach(sparkline => {
              let marketName = sparkline.data.marketName;
              sparklineList[marketName] = sparkline.get('values');
            });

            // Set the sparkline on each market in model data
            this.get('model.markets').forEach(market => {
              let marketName = market.get('marketName');
              if (sparklineList[marketName]) {
                market.set(`sparkline${query.timeFrame}`, sparklineList[marketName]);
              }
            });
          });
      }
    });

    // Set the change values for those columns.
    this.get('tableColumns').forEach(column => {
      if (column.component === 'market-table/change-column' && column.propertyName !== 'change') {
        let query = {
          platform: this.get('model.apiName'),
          timeFrame: column.propertyName.split("change")[1]
        };
        this.get('influxdb').getLastValues(query)
          .then(lastValues => {
            // Build price change list so it's easy to access
            let lastPriceList = {};
            lastValues.forEach(value => {
              let marketName = value.tags.market_name;
              lastPriceList[marketName] = value.values[0][1];
            });

            // Set the price change for each market
            this.get('model.markets').forEach(market => {
              let marketName = market.get('data.marketName');
              let currentPrice = market.get('data.last');
              let change = currentPrice / lastPriceList[marketName] * 100 - 100;
              if (isNaN(change)) change = 0;
              market.set(column.propertyName, change);
            });
          });
      }
    });
  },

  pageSize: 20,
  showPageSize: true,
  showComponentFooter: true,
  customMessages: customMessages,

  tableColumns: computed(function() {
    return [
      { "propertyName": "marketName",
        "title": "Market",
        "routeName": "platform.market" },
      { "propertyName": "last",
        "component": "market-table/price-column",
        "title": "Price",
        "className": "text-right"},
      { "propertyName": "baseVolume",
        "component": "market-table/volume-column",
        "title": "Volume",
        "className": "text-right",
        "sortDirection": "desc",
        "sortPrecedence": 1 },
      { "title": "% 30d",
        "propertyName": "change30d",
        "className": "text-right",
        "component": "market-table/change-column" },
      { "title": "% 7d",
        "propertyName": "change7d",
        "className": "text-right",
        "component": "market-table/change-column" },
      { "propertyName": "change",
        "title": "% 24h",
        "className": "text-right",
        "component": "market-table/change-column" },
      { "title": "% 6h",
        "propertyName": "change6h",
        "className": "text-right",
        "component": "market-table/change-column" },
      { "title": "% 1h",
        "propertyName": "change1h",
        "className": "text-right",
        "component": "market-table/change-column" },
      { "title": "% 10m",
        "propertyName": "change10m",
        "className": "text-right",
        "component": "market-table/change-column" },
      { "title": "30 day",
        "propertyName": "change30d", // this allows sorting of chart
        "className": "market-table sparkline",
        "component": "market-table/sparkline-column",
        "chartOptions": { timeFrame: '30d', groupBy: '24h'} },
      { "title": "7 day",
        "propertyName": "change7d", // this allows sorting of chart
        "className": "market-table sparkline",
        "component": "market-table/sparkline-column",
        "chartOptions": { timeFrame: '7d', groupBy: '6h'} },
      { "title": "24 hour",
        "propertyName": "change", // this allows sorting of chart
        "className": "market-table sparkline",
        "component": "market-table/sparkline-column",
        "chartOptions": { timeFrame: '24h', groupBy: '30m'} },
      { "title": "6 hour",
        "propertyName": "change6h", // this allows sorting of chart
        "className": "market-table sparkline",
        "component": "market-table/sparkline-column",
        "chartOptions": { timeFrame: '6h', groupBy: '5m'} },
      { "title": "1 hour",
        "propertyName": "change1h", // this allows sorting of chart
        "className": "market-table sparkline",
        "component": "market-table/sparkline-column",
        "chartOptions": { timeFrame: '1h', groupBy: '2m'} },
      { "title": "10 min",
        "propertyName": "change10m", // this allows sorting of chart
        "className": "market-table sparkline",
        "component": "market-table/sparkline-column",
        "chartOptions": { timeFrame: '10m', groupBy: '20s'} }
    ];
  })
});
