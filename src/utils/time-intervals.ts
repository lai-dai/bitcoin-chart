import { subDays, subHours, subMinutes, subMonths, subWeeks } from "date-fns";

export const timeIntervals: [string, string][] = [
  ["1m", "1m"],
  ["3m", "3m"],
  ["5m", "5m"],
  ["15m", "15m"],
  ["30m", "30m"],
  ["1h", "1h"],
  ["2h", "2h"],
  ["4h", "4h"],
  ["6h", "6h"],
  ["8h", "8h"],
  ["12h", "12h"],
  ["1d", "1d"],
  ["3d", "3d"],
  ["1w", "1w"],
  ["1M", "1M"],
];

/**
 *
 * @param time Thời gian cần đề tính khoảng thời gian (phút)
 * @param amount số phút cần để tính
 * @returns number
 */
export const getRange = (
  time: number,
  amount: number,
  timeInterval: string,
) => {
  let result: number = time;

  switch (timeInterval) {
    case "1m":
    case "3m":
    case "5m":
    case "15m":
    case "30m":
      result = new Date(
        subMinutes(time, amount * parseInt(timeInterval)),
      ).getTime();
      break;

    case "1h":
    case "2h":
    case "4h":
    case "6h":
    case "8h":
    case "12h":
      result = new Date(
        subHours(time, amount * parseInt(timeInterval)),
      ).getTime();
      break;

    case "1d":
    case "3d":
      result = new Date(
        subDays(time, amount * parseInt(timeInterval)),
      ).getTime();
      break;

    case "1w":
      result = new Date(
        subWeeks(time, amount * parseInt(timeInterval)),
      ).getTime();
      break;

    case "1M":
      result = new Date(
        subMonths(time, amount * parseInt(timeInterval)),
      ).getTime();
      break;
  }

  return result;
};
