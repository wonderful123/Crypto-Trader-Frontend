import EmberObject from '@ember/object';

const options = {};

export default EmberObject.extend({
  name: "Buy and hold",
  description: "Never sell.",
  options: options,

  checkSellCondition() {
    return false; // don't sell
  }
});
