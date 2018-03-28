import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin, {
    model() {
      let model = this.store.createRecord('user');
      //console.log('MODEL', model)

      return model;
    },
    activate: function() {
        this.controllerFor('login.registration-form').setProperties({
            firstName: null,
            lastName: null,
            email: null,
            password: null,
            passwordConfirmation: null
        });
    },
    register: function() {
      alert("REGISTRATION");
      //console.log("REGO");
    }
});
