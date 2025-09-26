import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";

export const responseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.success = <T>(message: string, data?: T) => {
    res.json(ApiResponse.success(message, data));
  };

  res.error = (message: string, statusCode: number = 400) => {
    res.status(statusCode).json(ApiResponse.error(message));
  };

  next();
};

// extend Express Response type
declare global {
  namespace Express {
    interface Response {
      success<T>(message: string, data?: T): void;
      error(message: string, statusCode?: number): void;
    }
  }
}
