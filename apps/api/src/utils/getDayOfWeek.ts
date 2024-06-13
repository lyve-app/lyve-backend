import { Days } from "../types/types";

export const getDayOfWeek = (date: Date): Days => {
  const daysOfWeek: Days[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  return daysOfWeek[date.getUTCDay()]!;
};
