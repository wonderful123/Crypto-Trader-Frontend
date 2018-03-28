import Component from '@ember/component';
import { computed, defineProperty } from '@ember/object';

export default Component.extend({
  classNameBindings: ['colour'],

  isUndefined: computed('value', function() {
    return (this.get('value')) ? false : true;
  }),

  init() {
    // Define computed properties in init so variable dependency key can be used.
    this._super(...arguments);
    let recordKey = 'record.'+this.get('column.propertyName');
    defineProperty(this, 'value', computed(recordKey, function(){
      return this.get(recordKey);
    }));

    defineProperty(this, 'colour', computed(recordKey, function(){
      if (this.get(recordKey) !== null)
        return (this.get(recordKey) >= 0 ? 'green' : 'red')
      else return 'lightgrey';
    }));
  },
});
