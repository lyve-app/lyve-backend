import { createErrorObject } from "../../../src/utils/createErrorObject"; // Adjust the path accordingly

describe("createErrorObject", () => {
  it("should create an error object for known status code 200", () => {
    const result = createErrorObject(200);
    expect(result).toEqual([
      {
        name: "OK",
        code: 200,
        msg: ""
      }
    ]);
  });

  it("should create an error object for known status code 404", () => {
    const result = createErrorObject(404);
    expect(result).toEqual([
      {
        name: "Not Found",
        code: 404,
        msg: ""
      }
    ]);
  });

  it("should create an error object for unknown status code 999", () => {
    const result = createErrorObject(999);
    expect(result).toEqual([
      {
        name: "Unknown Error",
        code: 999,
        msg: ""
      }
    ]);
  });

  it("should create an error object for known status code 200 with custom message", () => {
    const customMsg = "Everything is good";
    const result = createErrorObject(200, customMsg);
    expect(result).toEqual([
      {
        name: "OK",
        code: 200,
        msg: customMsg
      }
    ]);
  });

  it("should create an error object for unknown status code 999 with custom message", () => {
    const customMsg = "Something went wrong";
    const result = createErrorObject(999, customMsg);
    expect(result).toEqual([
      {
        name: "Unknown Error",
        code: 999,
        msg: customMsg
      }
    ]);
  });
});
