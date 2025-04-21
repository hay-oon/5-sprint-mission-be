"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.signin = exports.signup = void 0;
const authService = __importStar(require("./auth.service"));
const errorHandler_1 = __importDefault(require("../../utils/errorHandler"));
/**
 * 회원가입 처리
 */
const signup = async (req, res) => {
    try {
        const { email, nickname, password } = req.body;
        // 서비스 호출하여 회원가입 처리
        const user = await authService.register({
            email,
            nickname,
            password,
        });
        res.status(201).json({
            message: "회원가입이 완료되었습니다.",
            user,
        });
    }
    catch (error) {
        (0, errorHandler_1.default)(error, res);
    }
};
exports.signup = signup;
/**
 * 로그인 처리
 */
const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 서비스 호출하여 로그인 처리
        const { user, accessToken, refreshToken } = await authService.login({
            email,
            password,
        });
        // 응답에 쿠키로 리프레시 토큰 설정
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        });
        res.status(200).json({
            message: "로그인 성공",
            user,
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        (0, errorHandler_1.default)(error, res);
    }
};
exports.signin = signin;
/**
 * 토큰 갱신 처리
 */
const refreshToken = async (req, res) => {
    try {
        const typedReq = req;
        const token = typedReq.cookies.refreshToken || req.body.refreshToken;
        if (!token) {
            res.status(400).json({ message: "리프레시 토큰이 필요합니다." });
            return;
        }
        // 서비스 호출하여 토큰 갱신 처리
        const { accessToken, refreshToken } = await authService.refreshAccessToken(token);
        // 새 리프레시 토큰을 쿠키에 설정
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        });
        res.status(200).json({
            message: "토큰이 갱신되었습니다.",
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        (0, errorHandler_1.default)(error, res);
    }
};
exports.refreshToken = refreshToken;
