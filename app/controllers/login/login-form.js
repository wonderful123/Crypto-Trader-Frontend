import Controller from '@ember/controller';
import { inject } from '@ember/service';
import EmberValidations from 'ember-validations';

const validations = {
  email: {
    presence: { message: 'please enter a valid email address' },
    format: {
      with: /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+.)+[^<>()[\].,;:\s@"]{2,})$/i,
      allowBlank: false,
      message: 'please enter a valid email address'
    }
  },
  password: {
    presence: true
  }
};

export default Controller.extend(EmberValidations, {
  session: inject.service('session'),
  breadCrumb: 'Login Form',
  validations: validations,
  actions: {
    login: function() {
      let { identification, password } = this.getProperties('identification', 'password');
      this.get('session').authenticate('authenticator:devise', identification, password).catch((reason) => {
        this.set('errorMessage', reason.error || reason);
      });
      this.toast.success('Login OK');
    },
    invalid: function() {
      this.set('showValidation', true);
      this.toast.error('Invalid!');
    },
    registration: function() {
      this.transitionToRoute('login.registration-form');
    }
  }
});
