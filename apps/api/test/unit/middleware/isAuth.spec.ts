import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import isAuth from "../../../src/middleware/isAuth"; // Replace with the path to your isAuth middleware

const jwt =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqZXN0IiwiaWF0IjoxNzE4ODE5MDcyLCJleHAiOjMzMzA3MjYzODcyLCJhdWQiOiJ3d3cubHl2ZS50diIsInN1YiI6IjEifQ.XiyNTx_hTMHXcXQwKmdsjvTCGcH6PJ9F02e0XrRYgCg";
describe("isAuth Middleware", () => {
  it("should pass authentication and call next() with user data", () => {
    // Mock request object
    const mockReq = {
      headers: {
        authorization: "Bearer " + jwt // Replace with a valid JWT token
      }
    } as Request;

    // Mock response object
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    // Mock next function
    const mockNext: NextFunction = jest.fn();

    // Call isAuth middleware
    isAuth(mockReq, mockRes, mockNext);

    // Assertions
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq).toHaveProperty("user");
    expect(mockReq.user).toBeDefined();
  });

  it("should handle missing authorization header", () => {
    // Mock request object with missing authorization header
    const mockReq = {
      headers: {}
    } as Request;

    // Mock response object
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    // Mock next function
    const mockNext: NextFunction = jest.fn();

    // Call isAuth middleware
    isAuth(mockReq, mockRes, mockNext);

    // Assertions
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it("should handle invalid token", () => {
    // Mock request object with invalid token
    const mockReq = {
      headers: {
        authorization: "Bearer invalid_token" // Replace with an invalid JWT token
      }
    } as Request;

    // Mock response object
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    // Mock next function
    const mockNext: NextFunction = jest.fn();

    // Call isAuth middleware
    isAuth(mockReq, mockRes, mockNext);

    // Assertions
    expect(mockRes.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
    expect(mockRes.json).toHaveBeenCalled();
  });
});
