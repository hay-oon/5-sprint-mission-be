// @ts-nocheck

// 실제 서비스 함수를 임포트하기 전에 모듈 모킹 설정
// PrismaClient 모킹
const mockUserFindFirst = jest.fn();
const mockUserCreate = jest.fn();
const mockUserFindUnique = jest.fn();

jest.mock("@prisma/client", () => {
  const mockPrismaClient = jest.fn(() => ({
    user: {
      findFirst: mockUserFindFirst,
      create: mockUserCreate,
      findUnique: mockUserFindUnique,
    },
  }));
  return { PrismaClient: mockPrismaClient };
});

// bcrypt 모킹
const mockBcryptHash = jest.fn();
const mockBcryptCompare = jest.fn();

jest.mock("bcrypt", () => ({
  hash: mockBcryptHash,
  compare: mockBcryptCompare,
}));

// jsonwebtoken 모킹
const mockJwtSign = jest.fn();
const mockJwtVerify = jest.fn();

jest.mock("jsonwebtoken", () => ({
  sign: mockJwtSign,
  verify: mockJwtVerify,
}));

// 이제 모듈 임포트
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import {
  register,
  login,
  refreshAccessToken,
} from "../../../domains/auth/auth.service";
import { createError, unauthorizedError } from "../../../utils/errorHandler";
import { jest } from "@jest/globals";
import {
  UserData,
  User,
  LoginCredentials,
} from "../../../domains/auth/auth.types";

describe("Auth Service", () => {
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

    // 각 테스트마다 prisma 인스턴스 재설정
    prisma = new PrismaClient();
  });

  describe("register", () => {
    const mockUserData: UserData = {
      email: "test@example.com",
      nickname: "testuser",
      password: "password123",
    };

    it("새로운 사용자를 성공적으로 등록해야 함", async () => {
      // Given
      const hashedPassword = "hashed_password";
      const mockCreatedUser = {
        id: "1",
        email: mockUserData.email,
        nickname: mockUserData.nickname,
        encryptedPassword: hashedPassword,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserFindFirst.mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue(hashedPassword);
      mockUserCreate.mockResolvedValue(mockCreatedUser);

      // When
      const result = await register(mockUserData);

      // Then
      expect(mockUserFindFirst).toHaveBeenCalledWith({
        where: { email: mockUserData.email },
      });
      expect(mockBcryptHash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(mockUserCreate).toHaveBeenCalledWith({
        data: {
          email: mockUserData.email,
          nickname: mockUserData.nickname,
          encryptedPassword: hashedPassword,
        },
      });
      expect(result).toEqual({
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        nickname: mockCreatedUser.nickname,
        image: mockCreatedUser.image,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      });
    });

    it("이미 존재하는 이메일로 가입 시도 시 에러를 반환해야 함", async () => {
      // Given
      mockUserFindFirst.mockResolvedValue({ id: "1" });

      // When & Then
      await expect(register(mockUserData)).rejects.toThrow(
        "이미 등록된 이메일입니다."
      );
    });
  });

  describe("login", () => {
    const mockCredentials: LoginCredentials = {
      email: "test@example.com",
      password: "password123",
    };

    const mockUser = {
      id: "1",
      email: "test@example.com",
      nickname: "testuser",
      encryptedPassword: "hashed_password",
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("유효한 자격증명으로 로그인 시 토큰과 사용자 정보를 반환해야 함", async () => {
      // Given
      mockUserFindFirst.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(true);
      mockJwtSign
        .mockReturnValueOnce("mock-access-token")
        .mockReturnValueOnce("mock-refresh-token");

      // When
      const result = await login(mockCredentials);

      // Then
      expect(mockUserFindFirst).toHaveBeenCalledWith({
        where: { email: mockCredentials.email },
      });
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        mockCredentials.password,
        mockUser.encryptedPassword
      );
      expect(mockJwtSign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          nickname: mockUser.nickname,
          image: mockUser.image,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      });
    });

    it("존재하지 않는 이메일로 로그인 시도 시 에러를 반환해야 함", async () => {
      // Given
      mockUserFindFirst.mockResolvedValue(null);

      // When & Then
      await expect(login(mockCredentials)).rejects.toThrow(
        "이메일 또는 비밀번호가 일치하지 않습니다."
      );
    });

    it("잘못된 비밀번호로 로그인 시도 시 에러를 반환해야 함", async () => {
      // Given
      mockUserFindFirst.mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(false);

      // When & Then
      await expect(login(mockCredentials)).rejects.toThrow(
        "이메일 또는 비밀번호가 일치하지 않습니다."
      );
    });
  });

  describe("refreshAccessToken", () => {
    const mockRefreshToken = "valid-refresh-token";
    const mockUserId = "1";

    const mockUser = {
      id: mockUserId,
      email: "test@example.com",
      nickname: "testuser",
      encryptedPassword: "hashed_password",
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("유효한 리프레시 토큰으로 새 액세스 토큰을 발급해야 함", async () => {
      // Given
      mockJwtVerify.mockReturnValue({ id: mockUserId });
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockJwtSign
        .mockReturnValueOnce("new-access-token")
        .mockReturnValueOnce("new-refresh-token");

      // When
      const result = await refreshAccessToken(mockRefreshToken);

      // Then
      expect(mockJwtVerify).toHaveBeenCalledWith(
        mockRefreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      expect(mockJwtSign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
    });

    it("리프레시 토큰이 없는 경우 에러를 반환해야 함", async () => {
      // When & Then
      await expect(refreshAccessToken("")).rejects.toThrow(
        "리프레시 토큰이 없습니다."
      );
    });

    it("유효하지 않은 토큰 형식인 경우 에러를 반환해야 함", async () => {
      // Given
      mockJwtVerify.mockReturnValue({});

      // When & Then
      await expect(refreshAccessToken(mockRefreshToken)).rejects.toThrow(
        "유효하지 않은 토큰입니다."
      );
    });

    it("사용자가 존재하지 않는 경우 에러를 반환해야 함", async () => {
      // Given
      mockJwtVerify.mockReturnValue({ id: mockUserId });
      mockUserFindUnique.mockResolvedValue(null);

      // When & Then
      await expect(refreshAccessToken(mockRefreshToken)).rejects.toThrow(
        "사용자를 찾을 수 없습니다."
      );
    });

    it("JWT 토큰 검증 과정에서 오류가 발생하면 에러를 반환해야 함", async () => {
      // Given
      const tokenError = new Error("Token error");
      tokenError.name = "JsonWebTokenError";
      mockJwtVerify.mockImplementation(() => {
        throw tokenError;
      });

      // When & Then
      await expect(refreshAccessToken(mockRefreshToken)).rejects.toThrow(
        "유효하지 않거나 만료된 토큰입니다."
      );
    });

    it("토큰이 만료된 경우 에러를 반환해야 함", async () => {
      // Given
      const expiredError = new Error("Token expired");
      expiredError.name = "TokenExpiredError";
      mockJwtVerify.mockImplementation(() => {
        throw expiredError;
      });

      // When & Then
      await expect(refreshAccessToken(mockRefreshToken)).rejects.toThrow(
        "유효하지 않거나 만료된 토큰입니다."
      );
    });
  });
});
