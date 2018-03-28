import Controller from '@ember/controller';
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
}

export default Controller.extend(EmberValidations, {
  breadCrumb: 'Password Recovery',
  validations: validations,
  actions: {
    recover: function() {
      this.toast.success('OK');
    }
  }
});
