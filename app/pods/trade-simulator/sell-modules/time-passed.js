import EmberObject from '@ember/object';

const options = {
  daysPassed: {
    label: "Sell after number of days passed",
    component: "trade-simulator/module-options/input",
    value: 20
  },
};

export default EmberObject.extend({
  name: "Time passed",
  description: "Sells coin after X days.",
  options: options,

  checkSellCondition(coin, position, priceData, day) {
    let daysPassed = this.options.daysPassed.value;
    daysPassed = parseFloat(daysPassed);

    if (day >= (coin.buyDay + daysPassed))
      return true; // sell it
    else
      return false; // don't sell
  }
});
