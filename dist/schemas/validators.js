"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.password = exports.email = void 0;
exports.limitedString = limitedString;
const zod_1 = require("zod");
// 이메일 검증
exports.email = zod_1.z
    .string()
    .email({ message: "올바른 이메일 형식이 아닙니다" });
// 비밀번호 검증
exports.password = zod_1.z
    .string()
    .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" });
// 문자열 길이 제한 스키마 생성 함수
function limitedString(min, max, message) {
    return zod_1.z
        .string()
        .min(min, { message: `최소 ${min}자 이상 입력해주세요` })
        .max(max, { message: `최대 ${max}자까지 입력 가능합니다` });
}
