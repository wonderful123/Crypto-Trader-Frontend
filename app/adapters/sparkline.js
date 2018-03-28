import DS from 'ember-data';
import { inject as service } from '@ember/service';

export default DS.RESTAdapter.extend({
  influxSparkline: service(),

  queryRecord(store, type, query) {
    let options = Object.assign({}, query); // make a copy since it seems to be modified otherwise
    return this.get('influxSparkline').queryRecord(options);
  },

  query(store, type, query) {
    let options = Object.assign({}, query);
    return this.get('influxSparkline').query(options);
  },
});
