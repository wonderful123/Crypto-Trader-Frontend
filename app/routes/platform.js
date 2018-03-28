import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('platform', params.platform_id, {include: 'markets'});
  },
});
