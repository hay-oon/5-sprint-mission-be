import { z } from "zod";
import { email, password, limitedString } from "./validators";

// 회원가입 스키마
export const signupSchema = z
  .object({
    email: email,
    password: password,
    passwordConfirmation: password,
    nickname: limitedString(2, 30),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirmation"],
  });

// 로그인 스키마
export const signinSchema = z.object({
  email: email,
  password: password,
});

// 토큰 갱신 스키마
export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
