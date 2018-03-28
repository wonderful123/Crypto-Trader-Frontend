import ActionCable from 'ember-cable/services/cable';
import { inject as service } from '@ember/service';
import ENV from '../config/environment';

export default ActionCable.extend({
  BTCUSDT: 0,
  ETHUSDT: 0,

  store: service(),

  init() {
    this._super(...arguments);

    this.marketIdTable = {};
    this.subscriptions = [];

    this.set('consumer', this.createConsumer(ENV.actioncableHost));

    // create a poloniex subscription and keep price variables updated from actioncable
    this.subscribe('bittrex', {
      received: (data) => {
        if (data.market_name == 'USDT-BTC')
          this.set('BTCUSDT', data.values);
        if (data.market_name == 'USDT-ETH')
          this.set('ETHUSDT', data.values)
      }
    });
  },

  subscribePlatform(platformModel) {
    let apiName = platformModel.get('apiName');

    // Build marketIdTable for easy Id key look up for websocket updates
    let idLookupTable = {};

    platformModel.get('markets').then(markets => {
      markets.forEach(market => {
        idLookupTable[market.get('marketName')] = market.get('id');
      });

      let marketIdTable = this.get('marketIdTable');
      marketIdTable[apiName] = idLookupTable;

      this.set('marketIdTable', marketIdTable);
    });

    // create actioncable subscription
    let self = this;
    this.subscribe(apiName, {
      received: (data) => {
        var payload = { market: data.values };
        payload.market.id = self.marketIdTable[apiName][data.market_name];
        self.get('store').pushPayload('market', payload);
      }
    });
  },

  subscribe(apiName, handlers) {
    // Handler object contains the function methods to add for received, etc
    let subscriptions = this.get('subscriptions');
    subscriptions[apiName] = subscriptions[apiName] + 1 || 1; // increment or set to 1 if undefined
    return this.get('consumer').subscriptions.create({ channel: "PlatformChannel", platform: apiName }, handlers);
  }
});
