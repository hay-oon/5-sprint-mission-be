import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 인증 미들웨어: 요청 헤더에서 JWT 토큰을 확인하고 사용자 정보를 요청 객체에 추가
export const authenticateToken = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer {token}" 형식

    if (!token) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    };

    next();
  } catch (error) {
    console.error("인증 오류:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({ message: "유효하지 않거나 만료된 토큰입니다." });
    }

    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

export default authenticateToken;
