import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  value: computed('options.selected', function() {
    return this.get('options.selected').value;
  })
});
