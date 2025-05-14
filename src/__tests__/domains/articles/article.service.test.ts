// @ts-nocheck

// PrismaClient 모킹
const mockArticleCreate = jest.fn();
const mockArticleFindMany = jest.fn();
const mockArticleCount = jest.fn();
const mockArticleFindUnique = jest.fn();
const mockArticleUpdate = jest.fn();
const mockArticleDelete = jest.fn();
const mockUserFindUnique = jest.fn();
const mockUserFindMany = jest.fn();
const mockFavoriteCreate = jest.fn();
const mockFavoriteDelete = jest.fn();
const mockFavoriteFindFirst = jest.fn();
const mockFavoriteFindMany = jest.fn();
const mockFavoriteDeleteMany = jest.fn();

// Transaction 모킹
const mockTx = {
  article: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  favorite: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

const mockTransaction = jest.fn((callback) => callback(mockTx));

jest.mock("@prisma/client", () => {
  const mockPrismaClient = jest.fn(() => ({
    article: {
      create: mockArticleCreate,
      findMany: mockArticleFindMany,
      count: mockArticleCount,
      findUnique: mockArticleFindUnique,
      update: mockArticleUpdate,
      delete: mockArticleDelete,
    },
    user: {
      findUnique: mockUserFindUnique,
      findMany: mockUserFindMany,
    },
    favorite: {
      create: mockFavoriteCreate,
      delete: mockFavoriteDelete,
      findFirst: mockFavoriteFindFirst,
      findMany: mockFavoriteFindMany,
      deleteMany: mockFavoriteDeleteMany,
    },
    $transaction: mockTransaction,
  }));
  return { PrismaClient: mockPrismaClient };
});

// 모듈 임포트
import { PrismaClient } from "@prisma/client";
import * as formatters from "../../../utils/formatters";
import * as authHelpers from "../../../utils/authHelpers";
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  addFavorite,
  removeFavorite,
} from "../../../domains/articles/article.service";

// formatters 모듈의 함수들을 스파이로 설정
jest.spyOn(formatters, "createArticleResponseDto");
jest.spyOn(formatters, "attachFavoriteStatus");

// authHelpers 모듈의 함수들을 스파이로 설정
jest.spyOn(authHelpers, "verifyPermission");
jest.spyOn(authHelpers, "checkResourceExists");

describe("Article Service", () => {
  // 테스트 전에 모든 모의 함수 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createArticle", () => {
    it("새 게시글을 생성하고 응답 형식에 맞게 반환해야 함", async () => {
      // Given
      const title = "테스트 제목";
      const content = "테스트 내용";
      const userId = "user123";

      const mockArticle = {
        id: "article123",
        title,
        content,
        userId,
        favoriteCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser = {
        id: userId,
        nickname: "테스터",
      };

      const mockFormattedArticle = {
        id: mockArticle.id,
        title: mockArticle.title,
        content: mockArticle.content,
        favoriteCount: mockArticle.favoriteCount,
        createdAt: mockArticle.createdAt,
        updatedAt: mockArticle.updatedAt,
        writer: {
          id: mockUser.id,
          nickname: mockUser.nickname,
        },
        isFavorite: false,
      };

      mockArticleCreate.mockResolvedValue(mockArticle);
      mockUserFindUnique.mockResolvedValue(mockUser);
      formatters.createArticleResponseDto.mockReturnValue(mockFormattedArticle);

      // When
      const result = await createArticle(title, content, userId);

      // Then
      expect(mockArticleCreate).toHaveBeenCalledWith({
        data: {
          title,
          content,
          userId,
          favoriteCount: 0,
        },
      });

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          nickname: true,
        },
      });

      expect(formatters.createArticleResponseDto).toHaveBeenCalledWith(
        mockArticle,
        mockUser,
        false
      );

      expect(result).toEqual(mockFormattedArticle);
    });
  });

  describe("getArticles", () => {
    it("페이지네이션과 정렬을 적용하여 게시글 목록을 반환해야 함", async () => {
      // Given
      const page = 1;
      const limit = 10;
      const keyword = "검색어";
      const sortBy = "latest";
      const userId = "user123";

      const mockArticles = [
        {
          id: "article1",
          title: "첫 번째 게시글",
          content: "내용 1",
          userId: "user1",
          favoriteCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "article2",
          title: "두 번째 게시글",
          content: "내용 2",
          userId: "user2",
          favoriteCount: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockUsers = [
        { id: "user1", nickname: "사용자1" },
        { id: "user2", nickname: "사용자2" },
      ];

      const mockFavorites = [{ articleId: "article1" }];

      mockArticleFindMany.mockResolvedValue(mockArticles);
      mockUserFindMany.mockResolvedValue(mockUsers);
      mockFavoriteFindMany.mockResolvedValue(mockFavorites);
      mockArticleCount.mockResolvedValue(2);

      const expectedFormattedArticles = [
        {
          ...mockArticles[0],
          writer: { id: "user1", nickname: "사용자1" },
          isFavorite: true,
        },
        {
          ...mockArticles[1],
          writer: { id: "user2", nickname: "사용자2" },
          isFavorite: false,
        },
      ];

      formatters.attachFavoriteStatus.mockReturnValue(
        expectedFormattedArticles
      );

      // When
      const result = await getArticles(page, limit, keyword, sortBy, userId);

      // Then
      expect(mockArticleFindMany).toHaveBeenCalled();
      expect(mockUserFindMany).toHaveBeenCalledWith({
        where: {
          id: { in: ["user1", "user2"] },
        },
        select: {
          id: true,
          nickname: true,
        },
      });

      expect(mockFavoriteFindMany).toHaveBeenCalledWith({
        where: {
          userId,
          articleId: { in: ["article1", "article2"] },
        },
        select: {
          articleId: true,
        },
      });

      expect(formatters.attachFavoriteStatus).toHaveBeenCalled();
      expect(result).toEqual({
        totalCount: 2,
        articles: expectedFormattedArticles,
      });
    });

    it("사용자 ID가 없을 때 좋아요 상태를 확인하지 않아야 함", async () => {
      // Given
      mockArticleFindMany.mockResolvedValue([]);
      mockUserFindMany.mockResolvedValue([]);
      mockArticleCount.mockResolvedValue(0);

      // When
      await getArticles(1, 10, "", "latest", null);

      // Then
      expect(mockFavoriteFindMany).not.toHaveBeenCalled();
    });
  });

  describe("getArticleById", () => {
    it("게시글 ID로 게시글을 조회하고 사용자 좋아요 상태를 포함해야 함", async () => {
      // Given
      const articleId = "article123";
      const userId = "user123";

      const mockArticle = {
        id: articleId,
        title: "테스트 게시글",
        content: "내용",
        userId: "author123",
        favoriteCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser = {
        id: "author123",
        nickname: "작성자",
      };

      const mockFormattedArticle = {
        ...mockArticle,
        writer: {
          id: mockUser.id,
          nickname: mockUser.nickname,
        },
        isFavorite: true,
      };

      mockArticleFindUnique.mockResolvedValue(mockArticle);
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockFavoriteFindFirst.mockResolvedValue({ id: "favorite1" });
      formatters.createArticleResponseDto.mockReturnValue(mockFormattedArticle);

      // When
      const result = await getArticleById(articleId, userId);

      // Then
      expect(mockArticleFindUnique).toHaveBeenCalledWith({
        where: { id: articleId },
      });

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: mockArticle.userId },
        select: {
          id: true,
          nickname: true,
        },
      });

      expect(mockFavoriteFindFirst).toHaveBeenCalledWith({
        where: {
          userId,
          articleId,
        },
      });

      expect(formatters.createArticleResponseDto).toHaveBeenCalledWith(
        mockArticle,
        mockUser,
        true
      );

      expect(result).toEqual(mockFormattedArticle);
    });

    it("존재하지 않는 게시글 ID로 조회할 경우 null을 반환해야 함", async () => {
      // Given
      mockArticleFindUnique.mockResolvedValue(null);

      // When
      const result = await getArticleById("nonexistent");

      // Then
      expect(result).toBeNull();
      expect(mockUserFindUnique).not.toHaveBeenCalled();
    });
  });

  describe("updateArticle", () => {
    it("게시글 수정 권한이 있을 때 게시글을 수정해야 함", async () => {
      // Given
      const articleId = "article123";
      const userId = "user123";
      const title = "수정된 제목";
      const content = "수정된 내용";

      const mockArticle = {
        id: articleId,
        userId,
        title: "원래 제목",
        content: "원래 내용",
      };

      const mockUpdatedArticle = {
        ...mockArticle,
        title,
        content,
        updatedAt: new Date(),
      };

      const mockUser = {
        id: userId,
        nickname: "테스터",
      };

      const mockFormattedArticle = {
        ...mockUpdatedArticle,
        writer: {
          id: mockUser.id,
          nickname: mockUser.nickname,
        },
        isFavorite: false,
      };

      mockArticleFindUnique.mockResolvedValue(mockArticle);
      mockArticleUpdate.mockResolvedValue(mockUpdatedArticle);
      mockUserFindUnique.mockResolvedValue(mockUser);
      mockFavoriteFindFirst.mockResolvedValue(null);
      formatters.createArticleResponseDto.mockReturnValue(mockFormattedArticle);

      // When
      const result = await updateArticle(articleId, title, content, userId);

      // Then
      expect(mockArticleFindUnique).toHaveBeenCalledWith({
        where: { id: articleId },
      });

      expect(authHelpers.verifyPermission).toHaveBeenCalledWith(
        mockArticle,
        userId,
        "userId",
        "게시글"
      );

      expect(mockArticleUpdate).toHaveBeenCalledWith({
        where: { id: articleId },
        data: { title, content },
      });

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { id: mockUpdatedArticle.userId },
        select: {
          id: true,
          nickname: true,
        },
      });

      expect(mockFavoriteFindFirst).toHaveBeenCalledWith({
        where: {
          userId,
          articleId,
        },
      });

      expect(formatters.createArticleResponseDto).toHaveBeenCalledWith(
        mockUpdatedArticle,
        mockUser,
        false
      );

      expect(result).toEqual(mockFormattedArticle);
    });

    // 비동기 테스트에서 에러 처리 테스트 (done 콜백 사용)
    it("소유자가 아닌 사용자가 게시글을 수정하려고 할 때 에러를 발생시켜야 함", (done) => {
      // Given
      const articleId = "article123";
      const userId = "differentUser";

      const mockArticle = {
        id: articleId,
        userId: "originalUser",
        title: "원래 제목",
        content: "원래 내용",
      };

      mockArticleFindUnique.mockResolvedValue(mockArticle);

      // verifyPermission에서 에러 발생하도록 설정
      authHelpers.verifyPermission.mockImplementation(() => {
        throw new Error("게시글에 대한 수정 권한이 없습니다");
      });

      // When & Then
      updateArticle(articleId, "수정 시도", "수정 내용", userId).catch(
        (error) => {
          expect(error.message).toBe("게시글에 대한 수정 권한이 없습니다");
          done();
        }
      );
    });
  });

  describe("addFavorite", () => {
    it("게시글에 좋아요를 추가하고 좋아요 수를 증가시켜야 함", async () => {
      // Given
      const articleId = "article123";
      const userId = "user123";

      const mockArticle = {
        id: articleId,
        title: "테스트 게시글",
        userId: "author123",
        favoriteCount: 5,
      };

      const mockUpdatedArticle = {
        ...mockArticle,
        favoriteCount: 6,
      };

      const mockUser = {
        id: "author123",
        nickname: "작성자",
      };

      const mockFormattedArticle = {
        ...mockUpdatedArticle,
        writer: {
          id: mockUser.id,
          nickname: mockUser.nickname,
        },
        isFavorite: true,
      };

      // Transaction 내부 모킹 설정
      mockTx.article.findUnique.mockResolvedValue(mockArticle);
      mockTx.favorite.create.mockResolvedValue({
        id: "favorite1",
        articleId,
        userId,
      });
      mockTx.article.update.mockResolvedValue(mockUpdatedArticle);
      mockTx.user.findUnique.mockResolvedValue(mockUser);

      formatters.createArticleResponseDto.mockReturnValue(mockFormattedArticle);

      // When
      const result = await addFavorite(articleId, userId);

      // Then
      expect(mockTransaction).toHaveBeenCalled();
      expect(mockTx.article.findUnique).toHaveBeenCalledWith({
        where: { id: articleId },
      });

      expect(authHelpers.checkResourceExists).toHaveBeenCalledWith(
        mockArticle,
        "게시글"
      );

      expect(mockTx.favorite.create).toHaveBeenCalledWith({
        data: {
          articleId,
          userId,
        },
      });

      expect(mockTx.article.update).toHaveBeenCalledWith({
        where: { id: articleId },
        data: { favoriteCount: { increment: 1 } },
      });

      expect(mockTx.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUpdatedArticle.userId },
        select: {
          id: true,
          nickname: true,
        },
      });

      expect(formatters.createArticleResponseDto).toHaveBeenCalledWith(
        mockUpdatedArticle,
        mockUser,
        true
      );

      expect(result).toEqual(mockFormattedArticle);
    });
  });
});
