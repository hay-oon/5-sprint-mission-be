import express from "express";
import * as authController from "./auth.controller";
import { validate } from "../../middleware/validate";
import { signupSchema, signinSchema, refreshTokenSchema } from "../../schemas";

const router = express.Router();

// 회원가입 API
router.post("/signup", validate(signupSchema), authController.signup);

// 로그인 API
router.post("/signin", validate(signinSchema), authController.signin);

// 토큰 갱신 API
router.post(
  "/refresh-token",
  validate(refreshTokenSchema, "body"),
  authController.refreshToken
);

export default router;
