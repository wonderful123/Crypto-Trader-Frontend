import Component from '@ember/component';
import { computed } from '@ember/object';

const customMessages = {
  "searchLabel": "Filter",
  "searchPlaceholder": "Filter",
  "tableSummary": "Showing %@ - %@ of %@",
  "noDataToShow": "No matching markets."
};

export default Component.extend({
  tableData: null,
  pageSize: 100,
  customMessages: customMessages,

  totalValue: computed('holdings.{tradeHistory.totalProfit,remainingCapital,value,totalPurchased}', function() {
    let tradeProfit = this.get('holdings.tradeHistory.totalProfit');
    let totalTradesPurchased = this.get('holdings.tradeHistory.totalPurchased');
    let remainingCapital = this.get('holdings.remainingCapital');
    let holdingsValue = this.get('holdings.value');
    return tradeProfit + totalTradesPurchased + remainingCapital + holdingsValue;
  }),

  holdingsColumns: computed('symbol', function() {
    return [
      {
        propertyName: 'name',
        title: 'Coin',
        className: 'strong'
      },
      {
        propertyName: 'buyDay',
        title: 'Purchase day',
        className: "text-right",
      },
      {
        propertyName: 'buyPrice',
        title: 'Buy price ' + this.get('symbol'),
        component: 'trade-simulator/results/price-column',
        className: "text-right",
      },
      {
        propertyName: 'finalPrice',
        title: 'Final price ' + this.get('symbol'),
        component: 'trade-simulator/results/price-column',
        className: "text-right",
      },
      {
        propertyName: 'finalValue',
        title: 'Final Value ' + this.get('symbol'),
        component: 'trade-simulator/results/price-column',
        className: "text-right",
      },
      {
        propertyName: 'change',
        title: 'Change %',
        component: 'trade-simulator/results/change-column',
        className: "text-right",
      }
    ]
  }),

  tradeHistoryColumns: computed('symbol', function() {
    return [
      {
        propertyName: 'coin',
        title: 'Coin',
        className: 'strong'
      },
      {
        propertyName: 'buyDay',
        title: 'Purchase day',
        className: "text-right",
      },
      {
        propertyName: 'daysHeld',
        title: 'Days held',
        className: "text-right",
      },
      {
        propertyName: 'buyValue',
        title: 'Buy value ' + this.get('symbol'),
        component: 'trade-simulator/results/price-column',
        className: "text-right",
      },
      {
        propertyName: 'buyPrice',
        title: 'Buy price ' + this.get('symbol'),
        component: 'trade-simulator/results/price-column',
        className: "text-right",
      },
      {
        propertyName: 'sellValue',
        title: 'Sell value ' + this.get('symbol'),
        component: 'trade-simulator/results/price-column',
        className: "text-right",
      },
      {
        propertyName: 'sellPrice',
        title: 'Sell price ' + this.get('symbol'),
        component: 'trade-simulator/results/price-column',
        className: "text-right",
      },
      {
        propertyName: 'profit',
        title: 'Profit ' + this.get('symbol'),
        component: 'trade-simulator/results/price-column',
        className: "text-right",
      },
      {
        propertyName: 'gain',
        title: 'Gain %',
        component: 'trade-simulator/results/change-column',
        className: "text-right",
      }
    ]
  }),
});
