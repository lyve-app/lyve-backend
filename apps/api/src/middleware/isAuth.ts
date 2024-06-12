import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload, TypedResponse } from "../types/types";
import { jwtDecode } from "jwt-decode";
import { createErrorObject } from "../utils/createErrorObject";

const isAuth = (
  req: Request,
  res: Response<TypedResponse<null>>,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.FORBIDDEN,
          "Access denied. Invalid token format."
        )
      ]
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      data: null,
      error: [
        ...createErrorObject(
          httpStatus.FORBIDDEN,
          "Access denied. Invalid token format."
        )
      ]
    });
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    // You can add verification logic here using a library like `jsonwebtoken` if needed.
    req.user = { id: decoded.sub };
    return next();
  } catch (error) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      data: null,
      error: [...createErrorObject(httpStatus.FORBIDDEN, "Invalid token.")]
    });
  }
};

export default isAuth;
