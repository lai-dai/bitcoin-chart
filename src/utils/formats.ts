/* eslint-disable @typescript-eslint/unbound-method */
export function formatLargeNum(x: number, fractionDigits = 2) {
  if (isNaN(x)) return x;

  if (x < 9999) {
    return x.toFixed(fractionDigits);
  }

  if (x < 1000000) {
    return Math.round(x / 1000).toFixed(fractionDigits) + "K";
  }

  if (x < 10000000) {
    return (x / 1000000).toFixed(fractionDigits) + "M";
  }

  if (x < 1000000000) {
    return Math.round(x / 1000000).toFixed(fractionDigits) + "M";
  }

  if (x < 1000000000000) {
    return Math.round(x / 1000000000).toFixed(fractionDigits) + "B";
  }

  return "1T+";
}

// Get the current users primary locale
// Create a number format using Intl.NumberFormat
export const priceFormatter = (value: number) => {
  const currentLocale = window.navigator.languages[0];

  return Intl.NumberFormat(currentLocale, {
    style: "currency",
    currency: "USD", // Currency for data points
  }).format(value);
};
