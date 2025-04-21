"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.signinSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
const validators_1 = require("./validators");
// 회원가입 스키마
exports.signupSchema = zod_1.z
    .object({
    email: validators_1.email,
    password: validators_1.password,
    passwordConfirmation: validators_1.password,
    nickname: (0, validators_1.limitedString)(2, 30),
})
    .refine((data) => data.password === data.passwordConfirmation, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirmation"],
});
// 로그인 스키마
exports.signinSchema = zod_1.z.object({
    email: validators_1.email,
    password: validators_1.password,
});
// 토큰 갱신 스키마
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().optional(),
});
