// Express 요청 객체에 user 필드 추가
declare namespace Express {
  interface Request {
    user?: {
      id: number | string;
      email: string;
      nickname?: string;
    };
  }
}

// 에러 객체 확장
interface AppError extends Error {
  statusCode?: number;
}
