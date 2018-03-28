import EmberObject, { computed } from '@ember/object';
import moment from 'moment';
import Holdings from './holdings';
import { task, timeout } from 'ember-concurrency';

export default EmberObject.extend({
  init() {
    this.holdings = Holdings.create();
    this.set('tradeData', []);
  },

  // Status flags
  isCalculating: false,
  isRequestingData: false,

// TODO: THIS ISN"T OBSERVING STARTDATE CHANGES
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

    // Check if price data should be requested
    let priceData = this.get('priceData');
    if (priceData === undefined)
      priceData = this.getPriceData(p, influxCoinmarketcap);
    else // just wrap in promise if data already requested
      priceData = new Promise(resolve => resolve(priceData));

    // Calculate buys and sells
    priceData.then(priceData => {
      // Update flags
      this.set('isRequestingData', false);

      this.fillDataGaps(priceData, p);

      this.set('priceData', priceData);
      console.log('PRICEDATA', priceData)
      this.set('holdings.priceData', priceData);

      this.get('buildPriceAnalysis').perform(priceData, p);
    });
  },

  // Coin data often has gaps. This function fills them.
  fillDataGaps(priceData, p) {
    priceData.forEach(coin => {
      // Check if length of data values is equal to the start date to end date.
      // This means there is data for every day and no gaps of dates. If not, then fill it.
      let coinDataStartDate = coin.values[0].time;
      let requestedDataLength = moment(p.endDate).diff(moment(coinDataStartDate), 'days');

if (requestedDataLength !== coin.values.length)
console.log(`1st: ${coin.name} ${requestedDataLength} ${coin.values.length}`, coin.values)
      if (requestedDataLength > coin.values.length) {

        // Fill any gaps
        for (let i = coin.values.length - 2; i > -1; i--) {
          let timestampDifference = coin.values[i+1].time - coin.values[i].time;
          let dayDifference = timestampDifference / 86400000;

          if (dayDifference > 1) {
            for (let d = dayDifference - 1; d > 0; d--) {
              let obj = Object.assign({}, coin.values[i]);
              obj.time += d * 86400000;
              coin.values.splice(i + 1, 0, obj);
            }
          }
        }
if (requestedDataLength > coin.values.length) {
        console.log(`2nd: ${coin.name} ${requestedDataLength} ${coin.values.length}`, coin.values)
}
        // Check the data length is correct, otherwise the current data may not be updated to the current requested end date.
        // If so, a message should be warned to user and data filled.
        // if (requestedDataLength !== coin.values.length) {
        //   for (let i = 0; i < (requestedDataLength - coin.values.length); i++) {
        //     let lastValueObject = Object.assign({}, coin.values[coin.values.length - 1]);
        //     lastValueObject.time += (i + 1) * 86400000;
        //     coin.values.length = lastValueObject;
        //   }
        // }

      }
    });
  },

  doTrades: task(function * () {
    // Reset holdings
    this.get('holdings').reset();

    // Try to make sells and buys on each day
    let totalDays = moment(this.get('endDate')).diff(moment(this.get('startDate')), 'days') + 1;
    for (let day = 1; day < totalDays; day++) {
      yield this.makeSells(day);
      yield this.makeBuys(day);
    }

    // Calculate final values
    let finalValue = this.get('holdings').updateFinalHoldingsValue(this.get('capital'), this.get('priceData'));

    return finalValue;
  }).drop(),

  buildPriceAnalysis: task(function * (p) {
    this.set('isCalculating', true);

    const segmentDays = 1; // Amount of days to increment each analysis by
    let totalSegments = Math.floor(this.get('totalDays') / segmentDays);
    let startDate = new Date(p.startDate);

    // Reset array
    this.tradeData.length = 0;

    let totalDays = this.get('totalDays');

    // Loop through each start date segment
    for (let segment = 0; segment < totalSegments; segment++) {
      this.set('calculationStatus', `${segment + 1}/${totalDays}`);

      // A small timeout so UI updates during calculations
      yield timeout(1);

      // Reset the initial capital
      this.set('capital', p.initialCapital);

      let finalValue = yield this.get('doTrades').perform();

      this.tradeData.pushObject([
        Date.parse(this.get('startDate')),
        finalValue
      ]);

      this.get('holdings').getHoldingsValue(this.get('endDate'));

      // Increment starting date for the segment
      startDate.setDate(startDate.getDate() + segmentDays);
      this.set('startDate', startDate);
    }

    this.set('calculationStatus', "");
    this.set('isCalculating', false);
  }).drop(),

  getPriceData(p, influxCoinmarketcap) {
    // Get all the price data from database
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

      // Filter any coins with zero value
      priceData = priceData.filter(coin => {
        let position = coin.values.length - totalDays + day - 1;
        return (coin.values[position].close === 0) ? false : true;
      });

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
