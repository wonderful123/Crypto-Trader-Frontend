import EmberObject, { computed } from '@ember/object';
import moment from 'moment';
import Holdings from './holdings';

export default EmberObject.extend({
  holdings: Holdings.create(),

  // Status flags
  isCalculating: false,
  isRequestingData: false,

// THIS ISN"T OBSERVING STARTDATE CHANGES
  totalDays: computed('startDate', 'endDate', function() {
    return moment(this.get('endDate')).diff(moment(this.get('startDate')), 'days') + 1;
  }),

  buySize: computed('orderSize', 'initialCapital', function() {
    // TODO: buySize will change depending on how large the holdings become. It depends if something is sold, not on holdings total.
    let capital = this.get('initialCapital');
    let minimumBuySize = capital * this.get('orderSize') / 100; //calculate buy size

    return (capital < minimumBuySize) ? capital : minimumBuySize;
  }),

  makeTrades(p, influxCoinmarketcap) {
    // Initialize properties
    this.setProperties(p);

    // Reset the initial capital
    this.set('capital', p.initialCapital);

    // Check if price data should be requested
    //
    // NOT UPDATING END DATE CHANGES - THIS COULD BE CODED TO USE ALL DATA OR JUST REQUEST NEW DATA FOR END DATE
    //
    let priceData = this.get('priceData');
    if (priceData === undefined)
      priceData = this.getPriceData(p, influxCoinmarketcap);
    else // just wrap in promise if data already requested
      priceData = new Promise(resolve => resolve(priceData));

    // Calculate buys and sells
    priceData.then(priceData => {
      this.set('priceData', priceData);
      this.doTrades();
    });
  },

  doTrades() {
    // Update flags
    this.set('isRequestingData', false);
    this.set('isCalculating', true);

    // Reset holdings
    this.get('holdings').reset();

    // Try to make sells and buys on each day
    let totalDays = moment(this.get('endDate')).diff(moment(this.get('startDate')), 'days') + 1;
    for (let day = 1; day < totalDays; day++) {
      this.makeSells(day);
      this.makeBuys(day);
    }

    // Calculate final values
    this.get('holdings').updateFinalHoldingsValue(this.get('capital'), this.get('priceData'));

    this.set('isCalculating', false);
  },

  getPriceData(p, influxCoinmarketcap) {
    // Get all the price data and make it available to the trader.
    this.set('isRequestingData', true);

    return influxCoinmarketcap.getSeries({
      endDate: p.endDate,
      platform: p.platform,
      baseCurrency: p.baseCurrency,
      database: 'coinmarketcap'
    });
  },

  makeBuys(day) {
    let priceData = this.get('priceData');
    let capital = this.get('capital');

    // Only try to buy if there are funds to buy with
    if (capital > 0) {
      let totalDays = moment(this.get('endDate')).diff(moment(this.get('startDate')), 'days') + 1;
      let holdings = this.get('holdings');

      // Filter any coins that don't have data on this day yet (new markets)
      priceData = priceData.filter(coin => (coin.values.length > totalDays - day));

      let buyMatches = this.getBuyMatches(priceData, this.get('buySize'), day);

      // Remove any coin from priceData that we already have
      // (this is after getBuyMatches because marketcap rank needs to be calculated with all coins)
      holdings.holdings.forEach(holding => {
        buyMatches = buyMatches.filter(coin => coin.name !== holding.name)
      });

      // Buy until capital is zero or no more buy matches on that day
      while (capital > 0 && buyMatches.length > 0) {
        // Buy match is the first available match
        let buyMatch = buyMatches[0];

        // Get the buyMatch data
        let buyMatchData = priceData.find(coin => coin.name === buyMatch.name);
        let position = buyMatchData.values.length - totalDays + day - 1;
        let buyMatchClose = buyMatchData.values[position].close;

        // Add to holdings
        let buySize = this.get('buySize');
        let amount = buySize / buyMatchClose
        holdings.add(buyMatch.name, buyMatchClose, amount, day, buySize);

        // Update capital remaining
        capital -= buySize;
        this.set('capital', capital);

        // Remove match
        buyMatches.shift();
      }
    }
  },

  makeSells(day) {
    let priceData = this.get('priceData');
    let holdings = this.get('holdings');
    let selectedSellModules = this.get('selectedSellModules');
    let position = priceData[0].values.length - this.get('totalDays') + day;

    holdings.holdings.forEach(coin => {
      let shouldSell = selectedSellModules[0].checkSellCondition(coin, position, priceData, day)
      if (shouldSell) {
        let amount = coin.amount; // sell all of it
        holdings.sell(coin, amount, day, position, priceData);
      }
    })
  },

  getBuyMatches(priceData, buySize, day) {
    let selectedBuyModules = this.get('selectedBuyModules');
    let totalDays = moment(this.get('endDate')).diff(moment(this.get('startDate')), 'days') + 1;
    let buyMatches = [];

    selectedBuyModules.forEach(buyModule => {
      buyMatches = buyModule.getMatches(priceData, day, totalDays);

      // filter the price data so next buy module doesn't have to recalucate for the whole data set again
      // THIS IS THE 'AND' CASE
      let newPriceData = [];
      buyMatches.forEach(buyMatch => {
        let matchData = priceData.find(coin => coin.name === buyMatch.name);
        newPriceData.push(matchData);
      });

      priceData = newPriceData;
    });

    return buyMatches;
  },
});
