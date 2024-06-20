/* eslint-disable quotes */
import { getDayOfWeek } from "../../../src/utils/getDayOfWeek";

describe("getDayOfWeek", () => {
  it('should return "Wednesday" for date 2024-06-19', () => {
    const date = new Date("2024-06-19");
    const result = getDayOfWeek(date);
    expect(result).toBe("Wednesday");
  });

  it('should return "Thursday" for date 2024-06-20', () => {
    const date = new Date("2024-06-20");
    const result = getDayOfWeek(date);
    expect(result).toBe("Thursday");
  });

  it('should return "Friday" for date 2024-06-21', () => {
    const date = new Date("2024-06-21");
    const result = getDayOfWeek(date);
    expect(result).toBe("Friday");
  });

  it('should return "Saturday" for date 2024-06-22', () => {
    const date = new Date("2024-06-22");
    const result = getDayOfWeek(date);
    expect(result).toBe("Saturday");
  });

  it('should return "Sunday" for date 2024-06-23', () => {
    const date = new Date("2024-06-23");
    const result = getDayOfWeek(date);
    expect(result).toBe("Sunday");
  });

  it('should return "Monday" for date 2024-06-24', () => {
    const date = new Date("2024-06-24");
    const result = getDayOfWeek(date);
    expect(result).toBe("Monday");
  });

  it('should return "Tuesday" for date 2024-06-25', () => {
    const date = new Date("2024-06-25");
    const result = getDayOfWeek(date);
    expect(result).toBe("Tuesday");
  });
});
