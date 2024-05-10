import type { Request, Response } from "express";
import httpStatus from "http-status";
import prismaClient from "../config/prisma";
import { CreateUserCredentials, TypedRequest } from "../types/types";

export const dummyfunc = () => {
  return "0";
};
