import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import ajax from 'ic-ajax';
import ENV from '../../config/environment';
import DS from 'ember-data';

export default Route.extend({
  model() {
    let platforms = getInfluxPlatforms();

    let platformBaseCurrencyPairs = {};
    platforms.then(platforms => {
      platforms.forEach(platform => {
        platformBaseCurrencyPairs[platform] = getInfluxPlatformBaseCurrencies(platform);
      })
    })

    return hash({
      platforms: platforms,
      platformBaseCurrencyPairs: platformBaseCurrencyPairs,
      coins: this.store.findAll('coin')
    });
  }
})

function getInfluxPlatforms() {
  let query = 'SHOW TAG VALUES ON "cryptocompare" WITH KEY = "platform"';
  query = escape(query); //escape characters for query
  let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;
  let array = [];
  let arrayPromise = ajax({url: url}).then((request) => {
    for (var i = 0; i < request.results[0].series[0].values.length; i++) {
      var platform = request.results[0].series[0].values[i][1];
      if (platform !== null) {
        array.push(platform);
      }
    }
    return array;
  })
  return DS.PromiseArray.create({
    promise: arrayPromise
  });
}

function getInfluxPlatformBaseCurrencies(platform) {
  let query = `SHOW SERIES ON "cryptocompare" WHERE "platform"='${platform}'`;
  query = escape(query); //escape characters for query
  let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;
  let array = [];
  let arrayPromise = ajax({url: url}).then((request) => {
    for (let i = 0; i < request.results[0].series[0].values.length; i++) {
      let market_name = request.results[0].series[0].values[i][0].split(",")[1].split("=")[1];
      let base_currency = market_name.split("-")[1]; // Get first symbol of market_name
      if (base_currency !== null && !array.includes(base_currency)) {
        array.push(base_currency);
      }
    }
    return array;
  })
  return DS.PromiseArray.create({
    promise: arrayPromise
  });
}
