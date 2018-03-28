import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Trader from './trader';
import buyModules from './buy-modules';
import sellModules from './sell-modules';

export default Component.extend({
  // Properties sent from parent:
  // startDate, endDate, baseCurrency, platform, previousTimeframe

  init() {
    this._super(...arguments);

    this.trader = Trader.create();
  },

  influxCoinmarketcap: service(),

  initialCapital: 1000,
  orderSize: 10,
  buyModules: buyModules,
  sellModules: sellModules,

  startDate: null,
  endDate: null,

  symbol: computed('baseCurrency', function() {
    let currency = this.get('baseCurrency');
    if (currency === 'USDT' || currency === 'USD') return "$";
    else if (currency === 'BTC') return "₿";
    else if (currency === 'ETH') return "Ξ";
    else if (currency === 'XMR') return "ɱ";
    else return currency;
  }),

  actions: {
    calculate() {
      let p = this.getProperties('startDate', 'endDate');
      if (!p.startDate || !p.endDate) this.toast.warning('', 'Must select a start and end date', { timeOut: 2000, closeButton: true, hideDuration: 500 });
      else if (p.startDate >= p.endDate) this.toast.warning('', 'End date must be greater than starting date', { timeOut: 2000, closeButton: true, hideDuration: 500 });
      else {
        let p = this.getProperties('startDate', 'endDate', 'platform', 'baseCurrency', 'previousTimeframe', 'selectedBuyModules', 'selectedSellModules', 'initialCapital', 'orderSize');

        let trader = this.get('trader');
        let influxCoinmarketcapService = this.get('influxCoinmarketcap'); // Have to pass instance of service from component

        trader.makeTrades(p, influxCoinmarketcapService);
      }
    }
  },
});
