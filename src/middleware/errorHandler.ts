import { Request, Response, NextFunction } from "express";

// 에러 인터페이스 정의
interface AppError extends Error {
  statusCode?: number;
}

/**
 * 404 Not Found - 요청한 리소스를 찾을 수 없음
 * @param {string} message - 에러 메시지
 */
export const notFoundError = (message?: string): AppError => {
  const error: AppError = new Error(
    message || "요청한 리소스를 찾을 수 없습니다."
  );
  error.statusCode = 404;
  return error;
};

/**
 * 에러 처리 미들웨어
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("에러 발생:", err);

  // 상태 코드가 설정되어 있지 않으면 500
  const statusCode = err.statusCode || 500;

  // 에러 응답 객체
  const errorResponse = {
    error: {
      message: err.message || "서버 오류가 발생했습니다.",
      status: statusCode,
    },
  };

  // 에러 응답 전송
  res.status(statusCode).json(errorResponse);
};
