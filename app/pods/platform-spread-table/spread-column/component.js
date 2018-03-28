import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  colour: computed('record.spread', function() {
    let record = parseFloat(this.get('record.spread'));
    if (record > 20)
      return htmlSafe('color: #FF3333');
    if (record > 10)
      return htmlSafe('color: #CC5522');
    if (record > 3)
      return htmlSafe('color: #668855');
    else
      return htmlSafe('color: lightgrey');
  })
});
