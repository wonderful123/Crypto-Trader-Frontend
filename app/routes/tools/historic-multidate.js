import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import ajax from 'ic-ajax';
import ENV from '../config/environment';
import DS from 'ember-data';

export default Route.extend({
  model() {
    return hash({
      platforms: getInfluxPlatforms(),
      currencies: getInfluxBaseCurrencies()
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

function getInfluxBaseCurrencies() {
  let query = 'SHOW TAG VALUES ON "cryptocompare" WITH KEY = "market_name"';
  query = escape(query); //escape characters for query
  let url = `${ENV.influxDBHost}/query?pretty=true&db=markets&q=` + query;
  let array = [];
  let arrayPromise = ajax({url: url}).then((request) => {
    for (var i = 0; i < request.results[0].series[0].values.length; i++) {
      var market_name = request.results[0].series[0].values[i][1];
      var base_currency = market_name.split("-")[0]; // Get first symbol of market_name
      if (base_currency != null && !array.includes(base_currency)) {
        array.push(base_currency);
      }
    }
    return array;
  })
  return DS.PromiseArray.create({
    promise: arrayPromise
  });
}
