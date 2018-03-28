import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  influxdb: service(),

  getMarketCap(queryOptions) {
    let influxQuery = `SELECT last("market_cap") as market_cap FROM DATABASE
      WHERE TIMEQUERY GROUP BY "coin"`;

    let url = this.get('influxdb').buildUrl(influxQuery, queryOptions);

    return this.get('influxdb').influxRequest(url);
  },

  getSeries(options) {
    // Options are: { startDate, endDate, previousTimeFrame, platform, baseCurrency }
    // Returns: Promise array of all coins
    // {
    //   name: coinName,
    //   series: array of [ time, close, open, high, low, marketCap ],
    //   max: max,
    //   min: min,
    //   lastClosePercentile: lastClosePercentile
    // }

    let query = `SELECT *
    FROM DATABASE
    WHERE TIMEQUERY
    GROUP BY "coin"`;

    let url = this.get('influxdb').buildUrl(query, options);

    let dataPromise = this.get('influxdb').influxRequest(url)
      .then(request => {
        let coinList = [];
        request.forEach(coin => {
          // Build an array of coin objects
          let coinValues = [];
          coin.values.forEach(row => {
            // Create row object for values instead of array. Map all tags to values.
            let obj = {}
            coin.columns.forEach((column, index) => obj[column] = row[index]);

            // Change key market_cap to marketCap
            obj['marketCap'] = obj['market_cap'];
            delete obj['market_cap'];
            obj.time = Date.parse(obj.time);

            coinValues.push(obj);
          });
          coinList.push({ name: coin.tags.coin, values: coinValues });
        });

        return coinList;
      });

    return dataPromise;
  },
});
