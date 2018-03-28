import Service from '@ember/service';
import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';

export default Service.extend({
  influxdb: service(),

  // Query is for multiple records
  query(queryOptions) {
    let options = Object.assign({}, queryOptions);
    let url = this.urlForQuery(options);
    return this.get('influxdb').influxRequest(url)
      .then(markets => {
        if (markets)
          return this.queryReplaceFirstValues(markets, options);
      });
  },

  // QueryRecord is for single records
  queryRecord(queryOptions) {
    let options = Object.assign({}, queryOptions);
    let url = this.urlForQueryRecord(options);
    return this.get('ajax').request(url)
      .then(market => {
        market.id = queryOptions.marketName;
        return this.queryRecordReplaceFirstValues(market, options);
      });
  },

  /**
   * Check for null values in first position. Influx doesn't deal with this well
   * so another query needs to occur
   * @param  {array} markets Market series returned from influx query
   * @return {promise}      Modified data with correct values
   */
  queryReplaceFirstValues(markets, queryOptions) {
    let options = Object.assign({}, queryOptions);
    return this.get('influxdb').getLastValues(options)
      .then(lastValues => {
        // Convert last values to object for easy access
        let values = {};
        lastValues.forEach(last => {
          values[last.tags.market_name] = last.values[0][1];
        });

        // Set the first value on each market if it's null
        markets.forEach(market => {
          let firstValue = market.values[0][1];
          if (firstValue === null)
            market.values[0][1] = values[market.tags.market_name];
        });

        return new Promise(resolve => resolve(markets));
      });
  },

  /**
   * Checks if the first value is null, gets the previous value otherwise
   * @param  {Object} data         Data from getSparkline query
   * @param  {object} queryOptions Original query options
   * @return {Promise}             Data with set first value.
   */
  queryRecordReplaceFirstValues(data, queryOptions) {
    let firstValue = data[0].values[0][1];

    if (firstValue === null) {
      return this.get('influxdb').getLastValue(queryOptions)
        .then(valueData => {
          data[0].values[0][1] = valueData[0].values[0][1];
          return new Promise(resolve => resolve(data));
        });
    } else {
      return new Promise(resolve => resolve(data));
    }
  },

  urlForQueryRecord(queryOptions) {
    let influxQuery = `SELECT mean("last") as mean_last FROM DATABASE
      WHERE TIMEQUERY AND "market_name"='${queryOptions.marketName}' AND
      "platform"='${queryOptions.platform}' GROUP BY time(${queryOptions.groupBy}) fill(previous)`;

    return this.get('influxdb').buildUrl(influxQuery, queryOptions);
  },

  urlForQuery(queryOptions) {
    let influxQuery = `SELECT mean("last") as mean_last FROM DATABASE
      WHERE TIMEQUERY AND "platform"='${queryOptions.platform}'
      GROUP BY time(${queryOptions.groupBy}), "market_name" fill(previous)`;

    return this.get('influxdb').buildUrl(influxQuery, queryOptions);
  },
});
