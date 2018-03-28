import EmberObject from '@ember/object';

const options = {
  highestMarketCapRank: {
    label: "Highest market cap rank",
    component: "trade-simulator/module-options/input",
    value: "100"
  },
  lowestMarketCapRank: {
    label: "Lowest market cap rank",
    component: "trade-simulator/module-options/input",
    value: "200"
  },
};

export default EmberObject.extend({
  name: "Market cap rank",
  description: `Filters buys based on market cap ranking for that day.
    Make sure this module is first to calculate accurate market cap rankings
    otherwise rankings will be based on previous module results.`,
  options: options,

  getMatches(priceData, day, totalDays) {
    // Build a sorted list of closing prices for that day, filter by max, min values
    let marketCapList = [];

    // Simplify the list of market caps for each coin
    marketCapList = priceData.map(coin => {
      let position = coin.values.length - totalDays + day - 1;
      return { name: coin.name, marketCap: coin.values[position].marketCap };
    });

    // Sort by market cap highest first
    marketCapList.sort((a, b) => b.marketCap - a.marketCap);

    // Set rank based on sorted array
    marketCapList.forEach((coin, index) => {
      coin.marketCapRank = index + 1;
    });

    // Filter by max/min options
    let highestMarketCapRank = parseInt(this.options.highestMarketCapRank.value); // get the selected options
    let lowestMarketCapRank = parseInt(this.options.lowestMarketCapRank.value);

    if (lowestMarketCapRank !== "" && highestMarketCapRank <= lowestMarketCapRank)
      marketCapList = marketCapList.filter(coin => (coin.marketCapRank <= lowestMarketCapRank));

    if (highestMarketCapRank !== "" && highestMarketCapRank <= lowestMarketCapRank)
      marketCapList = marketCapList.filter(coin => (coin.marketCapRank >= highestMarketCapRank));

    // Return sorted list of coin names
    return marketCapList;
  }
});
