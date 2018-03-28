import Route from '@ember/routing/route';
import ENV from '../../config/environment';
import { hash } from 'rsvp';

export default Route.extend({
  model(params) {
    return hash({
      platform: this.modelFor('platform'),
      market: this.store.findRecord('market', params.market_id)
    });
  },
  setupController: function(controller, model) {
    this._super(controller, model);

    // Build marketIdTable for easy Id key look up for websocket updates
    model.platform.get('markets').then (markets => {
      markets.forEach(function(market) {
        controller.marketIdTable[market.get('marketName')] = market.get('id');
      })
    });

    // create actioncable subscription
    var _this = this;
    var consumer = this.get('actioncable').createConsumer(ENV.actioncableHost);
    consumer.subscriptions.create({channel: "PlatformChannel", platform: model.platform.get('platform.apiName')}, {
      received: (data) => {
        var payload = { market: data.values }
        payload.market.id = controller.marketIdTable[data.market_name];
        _this.store.pushPayload('market', payload);
      }
    });
  }
});
