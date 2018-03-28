import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return this.modelFor('platform');
  },
  setupController: function(controller, model) {
    this._super(...arguments);
    this.get('actioncable').subscribePlatform(model);
  }
});
