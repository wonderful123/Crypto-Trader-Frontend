import Route from '@ember/routing/route';
//import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

// export default Ember.Route.extend(AuthenticatedRouteMixin, {
export default Route.extend({
  model() {
    return this.store.findAll('user');
  },
});
