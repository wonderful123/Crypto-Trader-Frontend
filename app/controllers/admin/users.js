import Controller from '@ember/controller';

export default Controller.extend({
    breadCrumb: 'Users',

    actions: {
      createUser(user) {
        var data = this.store.createRecord('user', {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
        });
        data.save();
      },

      delete(user) {
        user.destroyRecord();
      }
    },
});
