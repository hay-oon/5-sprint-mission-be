"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../../utils/errorHandler");
const prisma = new client_1.PrismaClient();
/**
 * 사용자 회원가입 처리
 */
const register = async (userData) => {
    const { email, nickname, password } = userData;
    // 이메일 중복 검사
    const existingUser = await prisma.user.findFirst({
        where: { email },
    });
    if (existingUser) {
        throw (0, errorHandler_1.createError)("이미 등록된 이메일입니다.", 409, "DUPLICATE_EMAIL");
    }
    // 비밀번호 해싱
    const saltRounds = 10;
    const encryptedPassword = await bcrypt_1.default.hash(password, saltRounds);
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
exports.register = register;
/**
 * 사용자 로그인 처리 및 토큰 발급
 */
const login = async (credentials) => {
    const { email, password } = credentials;
    // 사용자 조회
    const user = await prisma.user.findFirst({
        where: { email },
    });
    if (!user) {
        throw (0, errorHandler_1.unauthorizedError)("이메일 또는 비밀번호가 일치하지 않습니다.");
    }
    // 비밀번호 검증
    const isPasswordValid = await bcrypt_1.default.compare(password, user.encryptedPassword);
    if (!isPasswordValid) {
        throw (0, errorHandler_1.unauthorizedError)("이메일 또는 비밀번호가 일치하지 않습니다.");
    }
    // JWT 토큰 생성
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    // 민감한 정보 제외하고 반환
    const { encryptedPassword: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};
exports.login = login;
/**
 * 리프레시 토큰을 이용한 새 액세스 토큰 발급 (JWT sliding session 적용)
 */
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw (0, errorHandler_1.unauthorizedError)("리프레시 토큰이 없습니다.");
    }
    try {
        // 리프레시 토큰 검증
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        if (!decoded.id) {
            throw (0, errorHandler_1.unauthorizedError)("유효하지 않은 토큰입니다.");
        }
        // 사용자 조회
        const user = await prisma.user.findUnique({
            where: { id: String(decoded.id) },
        });
        if (!user) {
            throw (0, errorHandler_1.notFoundError)("사용자를 찾을 수 없습니다.");
        }
        // 새 액세스 토큰 발급
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        // 새 리프레시 토큰 발급 (sliding session)
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === "JsonWebTokenError" ||
                error.name === "TokenExpiredError") {
                throw (0, errorHandler_1.unauthorizedError)("유효하지 않거나 만료된 토큰입니다.");
            }
        }
        throw error;
    }
};
exports.refreshAccessToken = refreshAccessToken;
