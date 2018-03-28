import Controller from '@ember/controller';
import { inject } from '@ember/service';
import EmberValidations from 'ember-validations';

const validations = {
  firstName: {
    presence: true
  },
  lastName: {
    presence: true
  },
  email: {
    presence: { message: 'please enter a valid email address' },
    format: {
      with: /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+.)+[^<>()[\].,;:\s@"]{2,})$/i,
      allowBlank: false,
      message: 'please enter a valid email address'
    }
  },
  password: {
    presence: true,
    confirmation: true
  },
  passwordConfirmation: {
    presence: { message: 'please confirm password' }
  }
};

export default Controller.extend(EmberValidations, {
  session: inject.service('session'),
  breadCrumb: 'Registration Form',
  validations: validations,

  actions: {
    register: function() {
      let newUser = this.get('model');
      newUser.save().catch((error) => {
          this.set('errorMessage', error)
        })
        .then(() => {
          this.get('session')
            .authenticate('authenticator:devise', newUser.get('email'), newUser.get('password')).this(() => {
              this.toast.success('Registered!');
            })
            .catch((reason) => {
              this.toast.success('Error: ', reason.error || reason);
              this.set('errorMessage', reason.error || reason);
            });
        })
    }
  }
});
