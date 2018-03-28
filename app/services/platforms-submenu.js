import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Service.extend({
  store: service(),

  platforms: computed(function() {
    return this.get('store').findAll('platform');
  })
});
