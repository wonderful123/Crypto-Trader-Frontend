import Component from '@ember/component';
import { defineProperty, computed } from '@ember/object';

export default Component.extend({
  classNameBindings: ['isPositive'],
  
  isPending: computed('value', function() {
    return (this.get('value') === undefined ? true : false)
  }),

  /**
   * Define computed properties so variable dependency key name can be used
   */
  init() {
    this._super(...arguments);
    let recordKey = 'record.' + this.get('column.propertyName');

    defineProperty(this, 'value', computed(recordKey, function() {
      return this.get(recordKey);
    }));

    defineProperty(this, 'isPositive', computed(recordKey, function() {
      if (this.get(recordKey) !== undefined)
        return (this.get(recordKey) >= 0 ? 'green' : 'red')
    }));
  },
});
