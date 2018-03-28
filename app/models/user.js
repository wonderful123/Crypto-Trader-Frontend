import DS from 'ember-data';

export default DS.Model.extend({
  firstName: DS.attr(),
  lastName: DS.attr(),
  email: DS.attr(),
  password: DS.attr(),
  signInCount: DS.attr(),
  lastSignInAt: DS.attr(),
  lastSignInIp: DS.attr()
});
