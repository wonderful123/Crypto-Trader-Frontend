import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  breadCrumb: computed.alias('model.name'),
});
