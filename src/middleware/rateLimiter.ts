import express from "express";

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

const windowMs = 15 * 60 * 1000; // 15 min
const maxRequests = 100;

const ipRequests = new Map<string, { count: number; startTime: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip:any = req.ip;
  const now = Date.now();

  const record = ipRequests.get(ip);

  if (!record) {
    ipRequests.set(ip, { count: 1, startTime: now });
    return next();
  }

  if (now - record.startTime < windowMs) {
    if (record.count >= maxRequests) {
      return res.status(429).json({ success: false, error: "Too many requests" });
    }
    record.count++;
    return next();
  }

  // Reset window
  ipRequests.set(ip, { count: 1, startTime: now });
  next();
}
