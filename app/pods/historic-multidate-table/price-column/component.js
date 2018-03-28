import Component from '@ember/component';
import { computed, defineProperty } from '@ember/object';

export default Component.extend({
  init() {
    // Define computed properties in init so variable dependency key can be used.
    this._super(...arguments);
    let recordKey = 'record.'+this.get('column.propertyName');
    defineProperty(this, 'value', computed(recordKey, function(){
      return this.get(recordKey);
    }));
  },
  
  isDefined: computed('value', function() {
    return (this.get('value')) ? true : false;
  })
});
