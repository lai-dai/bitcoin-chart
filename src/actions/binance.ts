import { type Time } from "lightweight-charts";
import { client } from "~/lib/api";
import { type operations } from "~/types/api";

export type ICandleStick = {
  openTime: number;
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  value: number;
  closeTime: number;
  baseAssetVolume: number;
  numberOfTrades: number;
  takerBuyVolume: number;
  takerBuyBaseAssetVolume: number;
  ignore: number;
};

/**
 * Fetch candlestick data from Binance API
 * @param currentTimeFrame Time interval (e.g., 1m, 5m, 30m)
 * @param currentCoin Cryptocurrency symbol (e.g., BTCUSDT)
 * @returns Array of candlestick data
 */
export const GetCandles = async (
  query: operations["klines"]["parameters"]["query"],
): Promise<ICandleStick[]> => {
  const response = await client.get<
    [
      number,
      string,
      string,
      string,
      string,
      string,
      number,
      string,
      number,
      string,
      string,
      string,
    ][]
  >("/klines", { params: query });

  return response.data.map((item) => ({
    time: item[0] as Time,
    openTime: item[0],
    open: parseFloat(item[1]),
    high: parseFloat(item[2]),
    low: parseFloat(item[3]),
    close: parseFloat(item[4]),
    volume: parseFloat(item[5]),
    value: parseFloat(item[5]),
    closeTime: item[6],
    baseAssetVolume: parseFloat(item[7]),
    numberOfTrades: item[8],
    takerBuyVolume: parseFloat(item[9]),
    takerBuyBaseAssetVolume: parseFloat(item[10]),
    ignore: parseFloat(item[11]),
  }));
};

/**
 * Get 24-hour percent change and crypto info
 * @param currentCoin Cryptocurrency symbol (e.g., BTCUSDT)
 * @returns Crypto ticker data
 */
export const GetCryptoInfo = async (
  currentCoin: string,
): Promise<{
  data: {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    lastPrice: string;
    volume: string;
    quoteVolume: string;
    openTime: number;
    closeTime: number;
    firstId: number;
    lastId: number;
    count: number;
  };
}> => {
  return await client.get("/ticker", {
    params: {
      symbol: currentCoin,
    },
  });
};

export const GetCryptoPriceInfo = async (
  currentCoin: string,
): Promise<{
  data: {
    symbol: string;
    price: string;
    time: number;
  };
}> => {
  return await client.get("/ticker/price", {
    params: {
      symbol: currentCoin,
    },
  });
};

/**
 * Cryptocurrency list with image URLs
 */
export const cryptoCoins = [
  {
    cryptoName: "BTCUSDT",
    cryptoImage: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  },
  {
    cryptoName: "ETHUSDT",
    cryptoImage: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  },
  {
    cryptoName: "SOLUSDT",
    cryptoImage: "https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png",
  },
  {
    cryptoName: "DOTUSDT",
    cryptoImage: "https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png",
  },
  {
    cryptoName: "BNBUSDT",
    cryptoImage: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  },
  {
    cryptoName: "LINKUSDT",
    cryptoImage: "https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png",
  },
  {
    cryptoName: "CAKEUSDT",
    cryptoImage: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
  },
  {
    cryptoName: "MATICUSDT",
    cryptoImage: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
  },
  {
    cryptoName: "OMUSDT",
    cryptoImage: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
  },
];

/**
 * Get the image URL of a cryptocurrency
 * @param getCoin Cryptocurrency symbol (e.g., BTCUSDT)
 * @returns Image URL or null
 */
export const getCryptoImage = (getCoin: string) => {
  const coin = cryptoCoins.find((crypto) => crypto.cryptoName === getCoin);
  return coin ? coin.cryptoImage : null;
};

/**
 * Convert Unix timestamp to human-readable date
 * @param unix Unix timestamp (milliseconds)
 * @returns Formatted date string
 */
export const unixToDate = (unix: number) => {
  return new Date(unix).toLocaleString();
};
