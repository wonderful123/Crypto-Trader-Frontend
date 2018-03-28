import DS from 'ember-data'

export default DS.Serializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    if (requestType === 'queryRecord') {
      return this.normalizeQueryRecordResponse(store, primaryModelClass, payload, id);
    } else if (requestType === 'query') {
      return this.normalizeQueryResponse(store, primaryModelClass, payload, id);
    }
  },

  normalizeQueryResponse(store, primaryModelClass, payload) {
    let sparklines = [];
    if (payload) {
      payload.forEach(market => {
        let values = market.values ? market.values : [];
        let change = null;

        if (values !== []) {
          values = values.map(v => [Date.parse(v[0]), v[1]] ) // set date to integer for use with sparkline
          values = values.filter(v => v[1] !== null); // filter null values
          change = values[values.length - 1][1] / values[0][1] * 100 - 100;
        }

        let s = {
          id: market.tags.market_name,
          type: "sparkline",
          attributes: {
            marketName: market.tags.market_name,
            change: change,
            values: values
          }
        }

        sparklines.push(s);
      })
    }

    return { data: sparklines };
  },

  normalizeQueryRecordResponse(store, primaryModelClass, payload) {
    let values = payload ? payload[0].values : []; // return empty array if no results
    let change = null;

    if (values !== []) {
      values = values.map(v => [Date.parse(v[0]), v[1]] ) // set date to integer for use with sparkline

      values = values.filter(v => v[1] !== null); // filter null values

      change = values[values.length - 1][1] / values[0][1] * 100 - 100;
    }

    payload = {
      data: {
        type: "sparkline",
        id: payload.id,
        attributes: {
          change: change,
          values: values,
        }
      }
    };
    return payload;
  }

});
