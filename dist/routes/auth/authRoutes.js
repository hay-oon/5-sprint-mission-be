import express from "express";
import * as authController from "./authController.js";
const router = express.Router();
// 회원가입 API
router.post("/signup", authController.signup);
// 로그인 API
router.post("/signin", authController.signin);
// 토큰 갱신 API
router.post("/refresh-token", authController.refreshToken);
export default router;
