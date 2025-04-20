import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../types/models";
import { handleError } from "../utils/errorHandler";
import { ExpressMiddleware } from "../types/express";

const prisma = new PrismaClient();

// JWT 에러 체크 함수
export function isJwtError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError" ||
    error.name === "NotBeforeError"
  );
}

// JWT 토큰 디코딩 결과 인터페이스
interface DecodedToken {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

// 사용자 인증을 위한 미들웨어
export const authMiddleware: ExpressMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Auth middleware - request headers:", {
      authorization: req.headers.authorization ? "Bearer ***" : undefined,
    });

    // Authorization 헤더에서 토큰 가져오기
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth middleware - missing or invalid token format");
      res.status(401).json({ message: "인증 토큰이 필요합니다." });
      return;
    }

    // Bearer 접두사 제거 후 토큰 추출
    const token = authHeader.split(" ")[1];

    // 토큰 검증
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    console.log("Auth middleware - decoded token:", {
      id: decoded.id,
      email: decoded.email,
    });

    // 사용자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { id: String(decoded.id) },
      select: { id: true, email: true, nickname: true },
    });

    if (!user) {
      console.log("Auth middleware - user not found for id:", decoded.id);
      res.status(401).json({ message: "유효하지 않은 사용자입니다." });
      return;
    }

    console.log("Auth middleware - user found:", {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    });

    // 요청 객체에 사용자 정보 추가
    req.user = user;
    next();
  } catch (error: unknown) {
    console.error("Auth middleware - error:", error);
    if (isJwtError(error)) {
      const err = error as Error;
      res.status(401).json({
        message:
          err.name === "TokenExpiredError"
            ? "만료된 토큰입니다."
            : "유효하지 않은 토큰입니다.",
      });
      return;
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다." });
    return;
  }
};
