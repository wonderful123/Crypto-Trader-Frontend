import Component from '@ember/component';
import { computed } from '@ember/object';

import BootstrapDropdownToggleMixin from 'ember-bootstrap/mixins/dropdown-toggle';

export default Component.extend(BootstrapDropdownToggleMixin, {
  actions: {
    setSortBy: function(selection) {
      let currentColumn = this.get('column.sortedBy').split('.')[0];
      this.sendAction('setSortBy', currentColumn, selection);
    }
  },

  selectionIsMarketCap: computed('column.sortedBy', function() {
    return this.get('column.sortedBy').includes("marketCap") ? true : false;
  }),

  selectionIsPrice: computed('column.sortedBy', function() {
   return this.get('column.sortedBy').includes("close") ? true : false;
  }),
  
  selectionIsPercentile: computed('column.sortedBy', function() {
    return this.get('column.sortedBy').includes("percentile") ? true : false;
  }),
});
