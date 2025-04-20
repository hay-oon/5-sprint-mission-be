import { NextFunction, Request, Response } from "express";
import "express";

// Express 미들웨어의 타입 정의
export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

// Express 라우트 핸들러 타입 정의 - 수정하여 호환성 문제 해결
export type ExpressHandler = (req: Request, res: Response) => any;

// Express 라우터 타입 정의
declare global {
  namespace Express {
    interface Router {
      use(...handlers: ExpressMiddleware[]): Express.Router;
      get(path: string, ...handlers: ExpressHandler[]): Express.Router;
      post(path: string, ...handlers: ExpressHandler[]): Express.Router;
      put(path: string, ...handlers: ExpressHandler[]): Express.Router;
      patch(path: string, ...handlers: ExpressHandler[]): Express.Router;
      delete(path: string, ...handlers: ExpressHandler[]): Express.Router;
    }

    interface Request {
      user?: {
        id: string | number;
        email: string;
        nickname?: string;
      };
    }
  }
}

// 이 모듈 선언은 로컬 타입이 아닌 모듈로 처리하기 위한 내보내기
export {};
