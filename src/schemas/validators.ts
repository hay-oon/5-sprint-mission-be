import { z } from "zod";

// 이메일 검증
export const email = z
  .string()
  .email({ message: "올바른 이메일 형식이 아닙니다" });

// 비밀번호 검증
export const password = z
  .string()
  .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" });

// 문자열 길이 제한 스키마 생성 함수
export function limitedString(min: number, max: number, message?: string) {
  return z
    .string()
    .min(min, { message: `최소 ${min}자 이상 입력해주세요` })
    .max(max, { message: `최대 ${max}자까지 입력 가능합니다` });
}
