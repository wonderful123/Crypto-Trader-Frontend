export function initialize(app) {
  app.register('actioncable:main', 'actioncable', { instantiate: true, singleton: true });
  app.inject('controller', 'actioncable', 'service:actioncable');
  app.inject('route', 'actioncable', 'service:actioncable');
  app.inject('component', 'actioncable', 'service:actioncable');
}

export default {
  name: 'actioncable',
  initialize: initialize
};
