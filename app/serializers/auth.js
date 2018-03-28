import { decamelize } from '@ember/string';

// export default DS.RESTSerializer.extend({
import JSONSerializer from 'ember-data/serializers/json';

export default JSONSerializer.extend({
  keyForAttribute(key) {
    return decamelize(key);
  },
  normalizeResponse(store, primaryModelClass, payload) {
    payload;
    //console.log('PAYLOAD', payload)

  return this._super(...arguments);
},
  serialize() { //snapshot, options) {
    var json = this._super(...arguments);
//console.log('JSON', json);
    // json = json.user;
    // delete json.user;
    // console.log('JSON2', json);

    return json;
  }
});
