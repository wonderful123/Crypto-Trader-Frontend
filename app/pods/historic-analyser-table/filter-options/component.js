import Component from '@ember/component';

const filterOptions = {};
const marketCapOptions = ["0", "500000", "1000000", "2000000", "5000000", "10000000", "100000000"];

export default Component.extend({
  isOpen: false,
  marketCapOptions: marketCapOptions,
  filterOptions: filterOptions,

  actions: {
    save: function() {
      let filterOptions = this.get('filterOptions');
      Object.keys(filterOptions).forEach((key) => { if (filterOptions[key] === "") filterOptions[key] = null; } ); // set all empty strings to null
      if (filterOptions.startDateMarketCapMinimum && filterOptions.startDateMarketCapMaximum
        && (filterOptions.startDateMarketCapMinimum >= filterOptions.startDateMarketCapMaximum)) {
          this.toast.error('Start date maximum market cap must be greater than minimum', 'Error:', { positionClass: "toast-bottom-full-width", timeOut: 3000, closeButton: true, hideDuration: 1000 });
      } else if (filterOptions.endDateMarketCapMinimum && filterOptions.endDateMarketCapMaximum
        && (filterOptions.endDateMarketCapMinimum >= filterOptions.endDateMarketCapMaximum)) {
          this.toast.error('End date maximum market cap must be greater than minimum', 'Error:', { positionClass: "toast-bottom-full-width", timeOut: 3000, closeButton: true, hideDuration: 1000 });
      } else {
        this.set('isOpen', false);
        this.sendAction('setFilters', filterOptions);
      }
    },
    
    clear: function() {
      this.set('filterOptions', {});
    }
  }
});
