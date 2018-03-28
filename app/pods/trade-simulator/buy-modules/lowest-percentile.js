import EmberObject from '@ember/object';

export default EmberObject.extend({
  init() {
    this._super(...arguments);
    this.options =
      {
        timePeriod: {
          label: "Percentile time period",
          selected: {name: "3 months", value: "90"},
          component: "trade-simulator/module-options/select",
          options: [
            {name: "1 week", value: "7"},
            {name: "1 month", value: "30"},
            {name: "3 months", value: "90"},
            {name: "6 months", value: "180"},
            {name: "1 year", value: "365"}
          ]
        },
        minPercentile: {
          label: "Minimum percentile",
          component: "trade-simulator/module-options/input",
          value: "1"
        },
        maxPercentile: {
          label: "Maximum percentile",
          component: "trade-simulator/module-options/input",
          value: "5"
        }
      };
    },

  name: "Lowest percentile",
  description: "Buys lowest percentile coins.",

  getMatches(priceData, day, totalDays) {
    let timePeriodOption = parseInt(this.options.timePeriod.selected.value);
    let matches = [];

    // Filter coins that don't have a full range of data to calculate percentile
    priceData = priceData.filter(coin => (coin.values.length > totalDays - day + timePeriodOption));

    priceData.forEach(coin => {
      // Calculate out max/min values before current day position over the selected time period then work out the percentile
      let position = coin.values.length - totalDays + day - 1;
      let startPosition = position - timePeriodOption;

      let timePeriodData = coin.values.slice(startPosition, position);
      let timePeriodClosingPrices = timePeriodData.map(data => data.close);
      let max = Math.max(...timePeriodClosingPrices);
      let min = Math.min(...timePeriodClosingPrices);
      let currentPrice = timePeriodClosingPrices[timePeriodClosingPrices.length - 1];
      let percentile = (currentPrice - min) / (max - min) * 100;

      let maxPercentileOption = this.options.maxPercentile.value; // get the selected options
      let minPercentileOption = this.options.minPercentile.value;
      if (percentile < maxPercentileOption && percentile > minPercentileOption) { // filter coins that are within min/max option range
        matches.push({name: coin.name, close: currentPrice, percentile: percentile}); // add coin to matches
      }
    })

    // Sort matches by percentile
    matches.sort((a,b) => a.percentile - b.percentile);

    return matches;
  }
});
