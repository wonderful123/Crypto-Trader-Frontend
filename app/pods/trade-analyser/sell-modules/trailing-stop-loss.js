import EmberObject from '@ember/object';

const options = {
  stopLossPercent: {
    label: "Percentage to follow behind price",
    component: "trade-simulator/module-options/input",
    value: 20
  }
};

export default EmberObject.extend({
  name: "Trailing stop loss",
  description: "Sells coin if price drops below stop.",
  options: options,

  checkSellCondition(coin, position, priceData, day) {
    let coinData = priceData.find(c => c.name === coin.name)

    // Calculate stop price starting at buy day and move it up if possible each day
    let totalDays = day - coin.buyDay;
    let startPosition = position - totalDays;
    let stopPrice = 0;
    for (let p = startPosition; p < position + 1; p++) {
      let price = coinData.series[p][1];
      let newStop = price * (1 - this.options.stopLossPercent.value);
      if (newStop > stopPrice) stopPrice = newStop; // check if stop should be moved up or left where it is.
    }

    let currentPrice = coinData.series[position][1];

    if (currentPrice < stopPrice)
      return true; // sell it
    else
      return false; // don't sell
  }
});
