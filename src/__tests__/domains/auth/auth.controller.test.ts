import { Request, Response } from "express";
import * as authService from "../../../domains/auth/auth.service";
import {
  signup,
  signin,
  refreshToken,
} from "../../../domains/auth/auth.controller";
import { jest } from "@jest/globals";
import { UserResponse, TokenResponse } from "../../../domains/auth/auth.types";

// Response 모킹
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response["status"];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response["json"];
  res.cookie = jest.fn().mockReturnValue(res) as unknown as Response["cookie"];
  return res;
};

// Request 모킹
const mockRequest = (body = {}, cookies = {}) => {
  return {
    body,
    cookies,
  } as Request;
};

describe("Auth Controller", () => {
  describe("signup", () => {
    it("회원가입 성공 시 201 상태코드와 함께 사용자 정보를 반환해야 함", async () => {
      // Given
      const mockUser: UserResponse = {
        id: "1",
        email: "test@example.com",
        nickname: "testuser",
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const req = mockRequest({
        email: "test@example.com",
        nickname: "testuser",
        password: "password123",
      });
      const res = mockResponse();

      jest.spyOn(authService, "register").mockResolvedValue(mockUser);

      // When
      await signup(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "회원가입이 완료되었습니다.",
        user: mockUser,
      });
    });

    it("회원가입 실패 시 에러 처리가 되어야 함", async () => {
      // Given
      const req = mockRequest({
        email: "test@example.com",
        nickname: "testuser",
        password: "password123",
      });
      const res = mockResponse();
      const error = new Error("회원가입 실패");

      jest.spyOn(authService, "register").mockRejectedValue(error);

      // When
      await signup(req, res);

      // Then
      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("signin", () => {
    it("로그인 성공 시 200 상태코드와 함께 토큰과 사용자 정보를 반환해야 함", async () => {
      // Given
      const mockLoginResponse: TokenResponse = {
        user: {
          id: "1",
          email: "test@example.com",
          nickname: "testuser",
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      };
      const req = mockRequest({
        email: "test@example.com",
        password: "password123",
      });
      const res = mockResponse();

      jest.spyOn(authService, "login").mockResolvedValue(mockLoginResponse);

      // When
      await signin(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        mockLoginResponse.refreshToken,
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "로그인 성공",
        ...mockLoginResponse,
      });
    });

    it("로그인 실패 시 에러 처리가 되어야 함", async () => {
      // Given
      const req = mockRequest({
        email: "test@example.com",
        password: "wrong-password",
      });
      const res = mockResponse();
      const error = new Error("로그인 실패");

      jest.spyOn(authService, "login").mockRejectedValue(error);

      // When
      await signin(req, res);

      // Then
      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    it("유효한 리프레시 토큰으로 새 토큰들을 발급해야 함 (쿠키에서 토큰 가져오기)", async () => {
      // Given
      const mockRefreshResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };
      const req = mockRequest({}, { refreshToken: "valid-refresh-token" });
      const res = mockResponse();

      jest
        .spyOn(authService, "refreshAccessToken")
        .mockResolvedValue(mockRefreshResponse);

      // When
      await refreshToken(req, res);

      // Then
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        "valid-refresh-token"
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        mockRefreshResponse.refreshToken,
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "토큰이 갱신되었습니다.",
        ...mockRefreshResponse,
      });
    });

    it("유효한 리프레시 토큰으로 새 토큰들을 발급해야 함 (body에서 토큰 가져오기)", async () => {
      // Given
      const mockRefreshResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };
      const req = mockRequest({ refreshToken: "valid-refresh-token" }, {});
      const res = mockResponse();

      jest
        .spyOn(authService, "refreshAccessToken")
        .mockResolvedValue(mockRefreshResponse);

      // When
      await refreshToken(req, res);

      // Then
      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        "valid-refresh-token"
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("리프레시 토큰이 없는 경우 400 에러를 반환해야 함", async () => {
      // Given
      const req = mockRequest({}, {});
      const res = mockResponse();

      // When
      await refreshToken(req, res);

      // Then
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "리프레시 토큰이 필요합니다.",
      });
    });

    it("토큰 갱신 실패 시 에러 처리가 되어야 함", async () => {
      // Given
      const req = mockRequest({}, { refreshToken: "invalid-refresh-token" });
      const res = mockResponse();
      const error = new Error("토큰 갱신 실패");

      jest.spyOn(authService, "refreshAccessToken").mockRejectedValue(error);

      // When
      await refreshToken(req, res);

      // Then
      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });
});
