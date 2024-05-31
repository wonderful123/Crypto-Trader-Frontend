# Crypto Trader Frontend

Shows aggregate crypto tickers from multiple sources.
The rails backend facilitates storing realtime data in InfluxDB at whatever detail level is required.
Can simulate trading strategies over past data ranges. The simulation module allows flexible strategies to be tested without recompiling the app. Javascript modules are loaded externally by the Ember app.
These strategies could be implemented in realtime to automate trading.

Example trading stategies:
  - Buy at a certain MACD trigger, sell when price falls 5% of buy price and follow the price rise with a stop limit if profitable.
  - Automatically trade the spread on prices between exchanges if there is profit.
  - Detect pump and dumps and trade them automatically.

All these can be simluated on past data then used for realtime trading.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd frontend`
* `yarn install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `yarn lint:js`
* `yarn lint:js --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
