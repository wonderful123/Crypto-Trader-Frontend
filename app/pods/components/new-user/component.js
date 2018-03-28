import Component from '@ember/component';

export default Component.extend({
  newUser: null,

  init() {
    this._super();
    this.set('newUser', {});
  },

  actions: {
    createUser(newUser) {
      this.createUser(newUser);
    },
    
    clear: function() {
      this.set('newUser.firstName', '');
      this.set('newUser.lastName', '');
      this.set('newUser.email', '');
      this.set('newUser.password', '');
    }
  }
});
