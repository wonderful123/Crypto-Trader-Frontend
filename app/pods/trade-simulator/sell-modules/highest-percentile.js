import EmberObject from '@ember/object';

const options = {
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
    value: "95"
  },
};

export default EmberObject.extend({
  name: "Highest percentile",
  description: "Sells coin when it reaches a percentile.",
  options: options,

  checkSellCondition(coin, position, priceData) {
    let timePeriodOption = this.options.timePeriod.value;

    let coinData = priceData.find(c => (c.name === coin.name)); // get the data for the coin

    let startPosition = position - timePeriodOption;
    let timePeriodData = coinData.series.slice(startPosition, position);  // get the data for that time period
    let timePeriodPrices = timePeriodData.map(data => (data[1])); // extract the prices

    let max = Math.max(...timePeriodPrices); // calculate max & min to workout percentile
    let min = Math.min(...timePeriodPrices);
    let currentPrice = timePeriodPrices[timePeriodPrices.length - 1];
    let percentile = (currentPrice - min) / (max - min) * 100;

    let minPercentileOption = this.options.minPercentile.value; // get the selected options

    if (percentile >= minPercentileOption)
      return true; // sell it
    else
      return false; // don't sell
  }
});
