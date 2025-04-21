import { Request, Response } from "express";
import * as authService from "./auth.service";
import handleError, { badRequestError } from "../../utils/errorHandler";
import { ExpressHandler } from "../../types/express";

/**
 * 회원가입 처리
 */
export const signup: ExpressHandler = async (req: Request, res: Response) => {
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
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * 로그인 처리
 */
export const signin: ExpressHandler = async (req: Request, res: Response) => {
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
  } catch (error: unknown) {
    handleError(error, res);
  }
};

interface RefreshTokenRequest extends Request {
  cookies: {
    refreshToken?: string;
  };
}

/**
 * 토큰 갱신 처리
 */
export const refreshToken: ExpressHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const typedReq = req as RefreshTokenRequest;
    const token = typedReq.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      res.status(400).json({ message: "리프레시 토큰이 필요합니다." });
      return;
    }

    // 서비스 호출하여 토큰 갱신 처리
    const { accessToken, refreshToken } = await authService.refreshAccessToken(
      token
    );

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
  } catch (error: unknown) {
    handleError(error, res);
  }
};
