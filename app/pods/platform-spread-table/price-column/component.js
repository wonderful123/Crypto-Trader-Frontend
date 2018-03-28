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

  classNameBindings: ['isDefined'],
  
  isDefined: computed('value', function() {
    if (this.get('value') === undefined)
      return 'lightgrey'
  })
});
