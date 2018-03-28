import { decamelize } from '@ember/string';
import DS from 'ember-data';

export default DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin,{
  keyForAttribute(key) {
    return decamelize(key);
  },
  attrs: {
     markets: { embedded: 'always' }
  }
});
