import EmberObject from '@ember/object';

const options = {
  maxPrice: {
    label: "Maximum price",
    component: "trade-simulator/module-options/input",
    value: ""
  },
  minPrice: {
    label: "Minimum price",
    component: "trade-simulator/module-options/input",
    value: "0.00000001"
  },
};

export default EmberObject.extend({
  name: "Lowest price",
  description: "Buys lowest priced coins.",
  options: options,

  getMatches(priceData, day, totalDays) {
    // Build a sorted list of closing prices for that day, filter by max, min values
    let closingPrices = [];

    // Simplify the list of closing prices for each coin
    closingPrices = priceData.map(coin => {
      let position = coin.values.length - totalDays + day - 1;
      return { name: coin.name, close: coin.values[position].close };
    })

    closingPrices = closingPrices.filter(coin => (coin.close !== null)); // remove any null prices that represent new markets
    closingPrices = closingPrices.filter(coin => (coin.close !== 0)); // remove any 0 prices

    // Filter by max/min options
    let maxPrice = this.options.maxPrice.value; // get the selected options
    let minPrice = this.options.minPrice.value;
    closingPrices = closingPrices.filter(coin => (coin.close > minPrice));

    if (maxPrice !== "" && maxPrice >= minPrice)
      closingPrices = closingPrices.filter(coin => (coin.close < maxPrice));

    // Sort by closing price
    closingPrices.sort((a, b) => a.close - b.close);

    // Return sorted list of coin names
    return closingPrices;
  }
});
