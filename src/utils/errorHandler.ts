import { Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  meta?: Record<string, any>;
}

// 에러 객체 생성
export function createError(
  message: string,
  statusCode = 500,
  code?: string
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
}

/**
 * Prisma 에러를 앱 에러로 변환
 */
export function handlePrismaError(error: unknown): AppError {
  if (error instanceof PrismaClientKnownRequestError) {
    // 일반적인 Prisma 에러 처리
    switch (error.code) {
      case "P2002": // 고유 제약 조건 위반
        return createError(
          `중복된 값이 존재합니다: ${error.meta?.target || "알 수 없는 필드"}`,
          409,
          "DUPLICATE_ENTRY"
        );
      case "P2025": // 레코드를 찾을 수 없음
        return createError(
          (error.meta?.cause as string) || "요청한 리소스를 찾을 수 없습니다",
          404,
          "NOT_FOUND"
        );
      case "P2003": // 외래 키 제약 조건 위반
        return createError(
          "관련된 리소스가 존재하지 않습니다",
          400,
          "FOREIGN_KEY_CONSTRAINT"
        );
      default:
        return createError(
          `데이터베이스 에러: ${error.message}`,
          500,
          `PRISMA_${error.code}`
        );
    }
  }

  // 일반 에러 처리
  if (error instanceof Error) {
    const appError = error as AppError;
    if (appError.statusCode) return appError;

    appError.statusCode = 500;
    appError.code = "INTERNAL_SERVER_ERROR";
    return appError;
  }

  // unknown 타입 에러 처리
  return createError("알 수 없는 에러가 발생했습니다", 500, "UNKNOWN_ERROR");
}

/**
 * 에러를 처리하고 응답을 반환합니다.
 */
export function handleError(error: unknown, res?: Response): AppError {
  const appError = handlePrismaError(error);

  // 응답 객체가 있으면 클라이언트에 에러 응답을 보냄
  if (res) {
    const statusCode = appError.statusCode || 500;
    res.status(statusCode).json({
      error: {
        message: appError.message,
        code: appError.code || "INTERNAL_SERVER_ERROR",
        ...(process.env.NODE_ENV !== "production" && { stack: appError.stack }),
      },
    });
  }

  return appError;
}

/**
 * NOT_FOUND (404) 에러를 생성합니다.
 */
export function notFoundError(
  message = "요청한 리소스를 찾을 수 없습니다"
): AppError {
  return createError(message, 404, "NOT_FOUND");
}

/**
 * UNAUTHORIZED (401) 에러를 생성합니다.
 */
export function unauthorizedError(message = "로그인이 필요합니다"): AppError {
  return createError(message, 401, "UNAUTHORIZED");
}

/**
 * FORBIDDEN (403) 에러를 생성합니다.
 */
export function forbiddenError(message = "권한이 없습니다"): AppError {
  return createError(message, 403, "FORBIDDEN");
}

/**
 * BAD_REQUEST (400) 에러를 생성합니다.
 */
export function badRequestError(message = "잘못된 요청입니다"): AppError {
  return createError(message, 400, "BAD_REQUEST");
}

export default handleError;
