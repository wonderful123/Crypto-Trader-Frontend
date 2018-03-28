import EmberObject from '@ember/object';

const options = {
  minMarketCap: {
    label: "Minimum market cap",
    component: "trade-simulator/module-options/input",
    value: "100000"
  },
  maxMarketCap: {
    label: "Maximum market cap",
    component: "trade-simulator/module-options/input",
    value: "1000000"
  },
};

export default EmberObject.extend({
  name: "Market cap",
  description: "Buy at a market cap range. Lowest first.",
  options: options,

  getMatches(priceData, day, totalDays) {
    // Build a sorted list of closing prices for that day, filter by max, min values
    let marketCapList = [];

    // Simplify the list of marketcaps for each coin
    marketCapList = priceData.map(coin => {
      let position = coin.values.length - totalDays + day - 1;
      return { name: coin.name, marketCap: coin.values[position].marketCap };
    })

    // Filter by max/min options
    let maxMarketCap = parseInt(this.options.maxMarketCap.value); // get the selected options
    let minMarketCap = parseInt(this.options.minMarketCap.value);

    if (minMarketCap !== "" && maxMarketCap >= minMarketCap)
      marketCapList = marketCapList.filter(coin => (coin.marketCap > minMarketCap));

    if (maxMarketCap !== "" && maxMarketCap >= minMarketCap)
      marketCapList = marketCapList.filter(coin => (coin.marketCap < maxMarketCap));

    // Sort by closing market cap lowest first
    marketCapList.sort((a, b) => a.marketCap - b.marketCap);

    // Return sorted list of coin names
    return marketCapList;
  }
});
