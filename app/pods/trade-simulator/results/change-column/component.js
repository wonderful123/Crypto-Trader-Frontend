import Component from '@ember/component';
import { defineProperty, computed } from '@ember/object'

export default Component.extend({
  classNameBindings: ['isPositive'],

  isPositive: computed('value', function() {
    return (this.get('value') >= 0 ? 'green' : 'red');
  }),

  init() {
    // Define computed properties in init so variable dependency key can be used.
    this._super(...arguments);
    let recordKey = 'record.'+this.get('column.propertyName');

    defineProperty(this, 'value', computed(recordKey, function(){
      return this.get(recordKey);
    }));
  },
});
