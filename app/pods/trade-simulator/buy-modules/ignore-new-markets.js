import EmberObject from '@ember/object';

const options = {
  daysToIgnore: {
    label: "Days to ignore",
    component: "trade-simulator/module-options/input",
    value: "0"
  }
};

export default EmberObject.extend({
  name: "Ignore new markets",
  description: "Ignore markets until there is at least that number of days of data available. These may be new coins or just newly listed markets.",
  options: options,

  getMatches(priceData, day, totalDays) {
    // Build a list of closing prices for that day, filter by max, min values then sort
    let daysToIgnore = parseInt(this.get('options').daysToIgnore.value);

    let matches = [];
    priceData.forEach(coin => {
      // Check offset position with days to ignore
      if (coin.values.length > totalDays - day + daysToIgnore)
        matches.push({ name: coin.name });
    });

    return matches;
  }
});
