import { helper } from '@ember/component/helper';

// {{format-number value decimals=2 commas=true sign=true}}
// 3456.5435345 => 3,456.54

export function formatNumber(value, hash) {
  var currency = parseFloat(value);

  if (value && hash.decimals !== null) {
    currency = currency.toFixed(hash.decimals);
  }

  if (hash.commas == true && currency > 999.99) {
    var parts = currency.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    currency = parts.join(".");
  }

  if (hash.sign == true && parseFloat(value) > 0) {
    currency = "+" + currency;
  }

  return currency;
}

export default helper(formatNumber);
