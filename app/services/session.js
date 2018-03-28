import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

import DS from 'ember-data';
import ESASession from "ember-simple-auth/services/session";

export default ESASession.extend({
  store: service(),

  currentUser: computed('isAuthenticated', function() {
    if (this.get('isAuthenticated')) {
      const promise = this.get('store').queryRecord('user', {})
      return DS.PromiseObject.create({ promise: promise })
    }
  })

});
