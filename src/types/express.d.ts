import { NextFunction, Request, Response } from "express";
import "express";

// Express 미들웨어의 타입 정의
export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Express 라우트 핸들러 타입 정의
export type ExpressHandler = (req: Request, res: Response) => any;

// Express 라우터 타입 정의
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
        email: string;
        nickname?: string;
      };
    }
  }
}

export {};
