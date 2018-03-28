import Controller from '@ember/controller';
import EmberValidations from 'ember-validations';

const validations = {
    password: {
      presence: true
    }
  };

export default Controller.extend(EmberValidations, {
    breadCrumb: 'Lock Screen',
    validations: validations,
    actions: {
        unlock: function() {
            this.toast.success('OK');
        }
    }
});
