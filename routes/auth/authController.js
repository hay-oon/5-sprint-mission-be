import * as authService from "./authService.js";

/**
 * 회원가입 처리
 */
export const signup = async (req, res) => {
  try {
    const { email, nickname, password, passwordConfirmation } = req.body;

    // 필수 필드 검증
    if (!email || !nickname || !password || !passwordConfirmation) {
      return res.status(400).json({ message: "모든 필드를 입력해야 합니다." });
    }

    // 비밀번호 확인 검증
    if (password !== passwordConfirmation) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 서비스 호출하여 회원가입 처리
    const user = await authService.register({
      email,
      nickname,
      password,
    });

    return res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      user,
    });
  } catch (error) {
    console.error("회원가입 오류:", error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 로그인 처리
 */
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 필수 필드 검증
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "이메일과 비밀번호를 모두 입력해야 합니다." });
    }

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

    return res.status(200).json({
      message: "로그인 성공",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("로그인 오류:", error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

/**
 * 토큰 갱신 처리
 */
export const refreshToken = async (req, res) => {
  try {
    // 서비스 호출하여 토큰 갱신 처리
    const { accessToken } = await authService.refreshAccessToken(
      req.cookies.refreshToken
    );

    return res.status(200).json({
      message: "토큰이 갱신되었습니다.",
      accessToken,
    });
  } catch (error) {
    console.error("토큰 갱신 오류:", error);

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
