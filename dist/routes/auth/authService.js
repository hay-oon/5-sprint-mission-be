import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createError, unauthorizedError, notFoundError, } from "../../utils/errorHandler.js";
const prisma = new PrismaClient();
/**
 * 사용자 회원가입 처리
 */
export const register = async (userData) => {
    const { email, nickname, password } = userData;
    // 이메일 중복 검사
    const existingUser = await prisma.user.findFirst({
        where: { email },
    });
    if (existingUser) {
        throw createError("이미 등록된 이메일입니다.", 409, "DUPLICATE_EMAIL");
    }
    // 비밀번호 해싱
    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    // 사용자 생성
    const newUser = await prisma.user.create({
        data: {
            email,
            nickname,
            encryptedPassword,
        },
    });
    // 민감한 정보 제외하고 반환
    const { encryptedPassword: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};
/**
 * 사용자 로그인 처리 및 토큰 발급
 */
export const login = async (credentials) => {
    const { email, password } = credentials;
    // 사용자 조회
    const user = await prisma.user.findFirst({
        where: { email },
    });
    if (!user) {
        throw unauthorizedError("이메일 또는 비밀번호가 일치하지 않습니다.");
    }
    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.encryptedPassword);
    if (!isPasswordValid) {
        throw unauthorizedError("이메일 또는 비밀번호가 일치하지 않습니다.");
    }
    // JWT 토큰 생성
    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    // 민감한 정보 제외하고 반환
    const { encryptedPassword: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};
/**
 * 리프레시 토큰을 이용한 새 액세스 토큰 발급 (JWT sliding session 적용)
 */
export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw unauthorizedError("리프레시 토큰이 없습니다.");
    }
    try {
        // 리프레시 토큰 검증
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (!decoded.id) {
            throw unauthorizedError("유효하지 않은 토큰입니다.");
        }
        // 사용자 조회
        const user = await prisma.user.findUnique({
            where: { id: String(decoded.id) },
        });
        if (!user) {
            throw notFoundError("사용자를 찾을 수 없습니다.");
        }
        // 새 액세스 토큰 발급
        const newAccessToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        // 새 리프레시 토큰 발급 (sliding session)
        const newRefreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === "JsonWebTokenError" ||
                error.name === "TokenExpiredError") {
                throw unauthorizedError("유효하지 않거나 만료된 토큰입니다.");
            }
        }
        throw error;
    }
};
