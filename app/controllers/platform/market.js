import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

const marketTableColumns = [
    { "propertyName": "marketName",
      "title": "Market",
      "routeName": "platform.market" },
    { "propertyName": "last",
      "component": "market-table/price-column",
      "title": "Price",
      "className": "text-right" },
    { "propertyName": "baseVolume",
      "component": "market-table/volume-column",
      "title": "Volume",
      "className": "text-right",
      "sortDirection": "desc",
      "sortPrecedence": 1 },
    { "propertyName": "change",
      "title": "Change",
      "data-value": "change",
      "className": "text-right",
      "component": "market-table/change-column" }
  ];

export default Controller.extend({
    breadCrumb: computed.alias('model.market.marketName'),
    marketIdTable: null, // to store market ID keys for easy websocket updates
    marketTableColumns: marketTableColumns,

    changeColor: computed('record.change', function() {
      if (this.get('model.market.change') >= 0) {
        return htmlSafe("color: green");
      }
      else {
        return htmlSafe("color: red");
      }
    }),
});
