import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 사용자 인증을 위한 미들웨어
export const authMiddleware = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 가져오기
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    // Bearer 접두사 제거 후 토큰 추출
    const token = authHeader.split(" ")[1];

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 사용자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, nickname: true },
    });

    if (!user) {
      return res.status(401).json({ message: "유효하지 않은 사용자입니다." });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "만료된 토큰입니다." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
