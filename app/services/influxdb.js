import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from '../config/environment';
import moment from 'moment';

// Can be set in the queryOptions.database value when building a url
const DATABASES = {
  cryptocompare: `"cryptocompare"."autogen"."price"`,
  coinmarketcap: `"coinmarketcap"."autogen"."coinmarketcap"`,
  default: `"markets"."default"."price"`,
}


export default Service.extend({
  ajax: service(),
  host: ENV.influxDBHost,
  queryPrefix: "/query?db=markets&q=",

  /**
   * Returns the last price for a timeFrame.
   * @param  {object} queryOptions timeFrame
   * @param  {object} queryOptions marketName
   * @param  {object} queryOptions platform
   * @return {Promise}             Returns last price
   */
  getLastValue(queryOptions) {
    let influxQuery = `SELECT last("last") AS "last_last" FROM DATABASE
      WHERE time < now() - ${queryOptions.timeFrame} AND
      "platform"='${queryOptions.platform}' AND
      "market_name"='${queryOptions.marketName}'
      GROUP BY "market_name"`;

    influxQuery = escape(influxQuery);

    let url = `${this.host}${this.queryPrefix}${influxQuery}`;

    return this.get('ajax').request(url);
  },

  /**
   * Returns the last prices for a timeFrame and platform.
   * @param  {object} queryOptions timeFrame
   * @param  {object} queryOptions platform
   * @return {Promise}             Returns last price
   */
  getLastValues(queryOptions) {
    let influxQuery = `SELECT last("last") AS "last_last" FROM DATABASE
      WHERE time < now() - ${queryOptions.timeFrame}
      AND "platform"='${queryOptions.platform}'
      GROUP BY "market_name"`;

    let url = this.buildUrl(influxQuery, queryOptions);

    return this.influxRequest(url);
  },

  getData(date, platform, baseCurrency) {
    // Gets the closing price at specific date
    let timeDiff = Math.abs(date - Date.now());
    let days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    let timeFrame = `${days}d`;
    let query = `SELECT last("close") FROM "cryptocompare"."autogen"."price" WHERE time < now() - ${timeFrame} AND "platform"='${platform}' AND "market_name"=~ /.*-${baseCurrency}/ GROUP BY "market_name"`;
    query = escape(query); //escape characters for query
    let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;
    let promise = this.get('ajax').request(url).then((request) => {
      let array = [];
      if (request.results[0].series) { // check request returned values
        for (var i = 0; i < request.results[0].series.length; i++) {
          var close = request.results[0].series[i].values[0][1];
          var market_name = request.results[0].series[i].tags.market_name;
          var coin = market_name.split("-")[0]; // Get second symbol of market_name
          if (coin != null && !array.includes(coin)) {
            array.pushObject({ name: coin, close: close });
          }
        }
      }
      return array;
    });
    return promise;
  },

  getCoinNames(platform, baseCurrency) {
    let query = `SHOW TAG VALUES ON "cryptocompare" WITH KEY = "market_name" WHERE "platform" = '${platform}' AND "market_name" =~ /.*-${baseCurrency}/`;
    query = escape(query); //escape characters for query
    let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;
    let promise = this.get('ajax').request(url).then(request => {
      let array = [];
      if (request.results[0].series) { // check request returned values
        for (var i = 0; i < request.results[0].series[0].values.length; i++) {
          var market_name = request.results[0].series[0].values[i][1];
          var coin = market_name.split("-")[0]; // Get second symbol of market_name
          if (coin != null && !array.includes(coin)) {
            array.pushObject(coin);
          }
        }
      }
      return array;
    });
    return promise;
  },

  getSeries(options) {
    // Options are: { startDate, endDate, previousTimeFrame, platform, baseCurrency }
    // Returns: Promise array of all coins
    // {
    //   name: coinName,
    //   series: array of [ timeStamp, close, open, high, low ],
    //   max: max,
    //   min: min,
    //   lastClosePercentile: lastClosePercentile
    // }

    // Calculate time query depending if arguments are defined or not
    let timeQuery = this.timeQueryString(options);

    let query = `SELECT mean("close") AS "close", mean("open") AS "open", mean("high") AS "high", mean("low") AS "low", mean("volume") AS "volume", mean("base_volume") AS "base_volume" FROM "cryptocompare"."autogen"."price" WHERE ${timeQuery} AND "platform"='${options.platform}' AND "market_name" =~ /.*-${options.baseCurrency}/ GROUP BY time(1d), "market_name" fill(null)`;
    query = encodeURI(query);
    let url = `${this.host}${this.queryPrefix}${query}`;
    let dataPromise = this.influxRequest(url).then(request => {
      var data = [];
      request.forEach(coin => {
        let coinName = coin.tags.market_name.split("-")[0]; // Get second symbol of market_name as coinName
        let series = coin.values.map(v => ([Date.parse(v[0]), v[1], v[2], v[3], v[4], v[5], v[6]])); // convert time to work with sparkline
        let seriesObject = coin.values.map(v => ({
          time: Date.parse(v[0]),
          close: v[1],
          high: v[2],
          low: v[3],
          open: v[4],
          volume: v[5],
          baseVolume: v[6]
        }));
        series.shift(); // remove first element because it's always null

        // Calculate max/min values
        let prices = series.map(e => { if (e[1] !== null) return e[1]; }); // Skip null values
        prices = prices.filter(val => { // filter undefined values for max/min calculation
          return val !== undefined;
        });
        let max = Math.max(...prices);
        let min = Math.min(...prices);
        let lastClose = prices[prices.length - 1];
        let lastClosePercentile = (lastClose - min) / (max - min) * 100;
        data.push({ name: coinName, series: series, max: max, min: min, lastClosePercentile: lastClosePercentile, seriesObject: seriesObject });
      })
      return data;
    })
    return dataPromise;
  },

  /**
   * Generates a time query string for influxdb based on which dates/timeframe
   * are provided. Any combination can be included
   * @param  {date} options.startDate start date of series
   * @param  {date} options.endDate end date of series
   * @param  {string} options.previousTimeFrame How much data to include before startDate
   * @return {string} returns a time query to inserted in the influx query
   */
  timeQueryString(options) {
    if (options.startDate && options.endDate && options.previousTimeframe) {
      let date = moment(options.startDate).format("YYYY-MM-DD HH:MM:SS.mmm"); // need to convert to correct format use minus (timeframe) with influx
      return `time > '${date}' - ${options.previousTimeframe} AND time < ${Date.parse(options.endDate)}ms`;
    } else if (options.startDate && options.endDate) { // if both dates supplied
      return `time > ${Date.parse(options.startDate)}ms AND time < ${Date.parse(options.endDate)}ms`;
    } else if (options.endDate) {
      return `time < ${Date.parse(options.endDate)}ms`;
    } else if (options.startDate) {
      return `time > ${Date.parse(options.startDate)}ms`;
    } else if (options.timeFrame) { // between now - timeFrame
      return `time > now() - ${options.timeFrame}`;
    } else { // otherwise all data
      return "";
    }
  },

  /**
   * Ajax call to influxDB, checks for returned results and returns series
   * @param  {string} query influxDB query
   * @return {Promise}       returns query series response as promise
   */
  influxRequest(url) {
    return this.get('ajax').request(url)
      .then(response => {
        if (response.results[0].series) { // if data was received
          return response.results[0].series;
        }
        else {
          return null;
        }
      })
      .catch(function(error) {
        console.error('Influx Request ERROR', error);
      })
  },

  /**
   * Builds an influx url from a query string
   * @param  {string} influxQuery Influx query statement
   * @return {string}             Escaped url to use with ajax call
   */
  buildUrl(influxQuery, queryOptions) {
    // Build the time query
    let timeQuery = this.timeQueryString(queryOptions);
    influxQuery = influxQuery.replace("TIMEQUERY", timeQuery);

    // Set the database option
    let database = DATABASES[queryOptions.database] || DATABASES['default'];
    influxQuery = influxQuery.replace("DATABASE", database);
    
    influxQuery = encodeURI(influxQuery);
    return `${this.host}${this.queryPrefix}${influxQuery}`;
  },
});
