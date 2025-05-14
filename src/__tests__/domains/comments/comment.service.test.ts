// @ts-nocheck

// PrismaClient 모킹
const mockCommentCreate = jest.fn();
const mockCommentFindMany = jest.fn();
const mockCommentFindUnique = jest.fn();
const mockCommentUpdate = jest.fn();
const mockCommentDelete = jest.fn();
const mockArticleFindUnique = jest.fn();
const mockProductFindUnique = jest.fn();

jest.mock("@prisma/client", () => {
  const mockPrismaClient = jest.fn(() => ({
    comment: {
      create: mockCommentCreate,
      findMany: mockCommentFindMany,
      findUnique: mockCommentFindUnique,
      update: mockCommentUpdate,
      delete: mockCommentDelete,
    },
    article: {
      findUnique: mockArticleFindUnique,
    },
    product: {
      findUnique: mockProductFindUnique,
    },
  }));
  return { PrismaClient: mockPrismaClient };
});

// 에러 핸들러 모킹
jest.mock("../../../utils/errorHandler", () => ({
  notFoundError: jest.fn((message) => new Error(message)),
  forbiddenError: jest.fn((message) => new Error(message)),
}));

// 모듈 임포트
import { PrismaClient } from "@prisma/client";
import { notFoundError, forbiddenError } from "../../../utils/errorHandler";
import {
  createArticleComment,
  createProductComment,
  getArticleComments,
  getProductComments,
  updateComment,
  deleteComment,
} from "../../../domains/comments/comment.service";

describe("Comment Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createArticleComment", () => {
    it("게시글이 존재할 때 댓글을 성공적으로 생성해야 함", async () => {
      // Given
      const content = "테스트 댓글";
      const articleId = "article123";
      const userId = "user123";

      const mockArticle = {
        id: articleId,
        title: "테스트 게시글",
      };

      const mockCreatedComment = {
        id: "comment123",
        content,
        userId,
        articleId,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          nickname: "테스터",
        },
      };

      mockArticleFindUnique.mockResolvedValue(mockArticle);
      mockCommentCreate.mockResolvedValue(mockCreatedComment);

      // When
      const result = await createArticleComment(content, articleId, userId);

      // Then
      expect(mockArticleFindUnique).toHaveBeenCalledWith({
        where: { id: articleId },
      });

      expect(mockCommentCreate).toHaveBeenCalledWith({
        data: {
          content,
          userId: String(userId),
          articleId,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              nickname: true,
            },
          },
        },
      });

      expect(result).toEqual(mockCreatedComment);
    });

    it("게시글이 존재하지 않을 때 에러를 발생시켜야 함", async () => {
      // Given
      mockArticleFindUnique.mockResolvedValue(null);

      // When & Then
      await expect(
        createArticleComment("댓글 내용", "nonexistent", "user123")
      ).rejects.toThrow("게시글을 찾을 수 없습니다.");

      expect(notFoundError).toHaveBeenCalledWith("게시글을 찾을 수 없습니다.");
      expect(mockCommentCreate).not.toHaveBeenCalled();
    });
  });

  describe("getArticleComments", () => {
    // done 콜백을 사용한 비동기 테스트
    it("페이지네이션을 적용하여 게시글 댓글을 조회해야 함", (done) => {
      // Given
      const articleId = "article123";
      const cursor = "comment100";
      const limit = 5;

      const mockArticle = {
        id: articleId,
        title: "테스트 게시글",
      };

      // limit+1개의 댓글을 생성 (마지막 항목은 nextCursor로 사용됨)
      const mockComments = Array.from({ length: limit + 1 }, (_, i) => ({
        id: `comment${i + 101}`,
        content: `댓글 내용 ${i + 1}`,
        userId: "user123",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          nickname: "테스터",
        },
      }));

      // 실제 서비스 구현에서는 limit+1 개를 요청하고, 결과가 limit보다 많으면
      // 마지막 항목을 nextCursor로 사용함
      // 따라서 getArticleComments의 결과에서는 mockComments의 마지막 항목이 제거되어야 함
      const expectedComments = mockComments.slice(0, limit);
      const lastComment = mockComments[limit];

      mockArticleFindUnique.mockResolvedValue(mockArticle);
      mockCommentFindMany.mockResolvedValue(mockComments);

      // When
      getArticleComments(articleId, cursor, limit)
        .then((result) => {
          // Then
          expect(mockArticleFindUnique).toHaveBeenCalledWith({
            where: { id: articleId },
          });

          expect(mockCommentFindMany).toHaveBeenCalledWith({
            where: {
              articleId,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: limit + 1,
            cursor: {
              id: cursor,
            },
            skip: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              updatedAt: true,
              userId: true,
              user: {
                select: {
                  nickname: true,
                },
              },
            },
          });

          // 마지막 항목은 nextCursor를 위해 제거되어야 함
          expect(result.comments.length).toBe(limit);
          expect(result.nextCursor).toBe(lastComment.id);

          done();
        })
        .catch(done);
    });

    // async/await 사용한 비동기 테스트
    it("더 이상 페이지가 없을 때 nextCursor를 null로 반환해야 함", async () => {
      // Given
      const articleId = "article123";
      const limit = 10;

      const mockArticle = {
        id: articleId,
        title: "테스트 게시글",
      };

      // limit보다 적은 댓글이 있는 경우
      const mockComments = Array.from({ length: 5 }, (_, i) => ({
        id: `comment${i + 1}`,
        content: `댓글 내용 ${i + 1}`,
        userId: "user123",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          nickname: "테스터",
        },
      }));

      mockArticleFindUnique.mockResolvedValue(mockArticle);
      mockCommentFindMany.mockResolvedValue(mockComments);

      // When
      const result = await getArticleComments(articleId, undefined, limit);

      // Then
      expect(result.comments.length).toBe(mockComments.length);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe("updateComment", () => {
    it("댓글 소유자가 댓글을 수정할 수 있어야 함", async () => {
      // Given
      const commentId = "comment123";
      const userId = "user123";
      const newContent = "수정된 댓글";

      const mockComment = {
        id: commentId,
        content: "원래 댓글",
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedComment = {
        ...mockComment,
        content: newContent,
        updatedAt: new Date(),
        user: {
          nickname: "테스터",
        },
      };

      mockCommentFindUnique.mockResolvedValue(mockComment);
      mockCommentUpdate.mockResolvedValue(mockUpdatedComment);

      // When
      const result = await updateComment(commentId, newContent, userId);

      // Then
      expect(mockCommentFindUnique).toHaveBeenCalledWith({
        where: { id: commentId },
      });

      expect(mockCommentUpdate).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { content: newContent },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              nickname: true,
            },
          },
        },
      });

      expect(result).toEqual(mockUpdatedComment);
    });

    it("다른 사용자의 댓글을 수정하려고 할 때 에러를 발생시켜야 함", async () => {
      // Given
      const commentId = "comment123";
      const originalUserId = "user123";
      const differentUserId = "user456";
      const newContent = "수정 시도";

      const mockComment = {
        id: commentId,
        content: "원래 댓글",
        userId: originalUserId,
      };

      mockCommentFindUnique.mockResolvedValue(mockComment);
      mockCommentUpdate.mockImplementation(() => {
        throw new Error("권한이 없습니다.");
      });

      // forbiddenError를 던지도록 설정
      forbiddenError.mockImplementation((message) => {
        const error = new Error(message);
        error.status = 403;
        return error;
      });

      // When & Then
      try {
        await updateComment(commentId, newContent, differentUserId);
        // 이 줄이 실행되면 테스트는 실패해야 함
        fail("에러가 발생하지 않았습니다");
      } catch (error) {
        expect(error.message).toContain("권한이 없습니다");
        expect(mockCommentUpdate).not.toHaveBeenCalled();
      }
    });
  });

  describe("deleteComment", () => {
    it("댓글 소유자가 댓글을 삭제할 수 있어야 함", async () => {
      // Given
      const commentId = "comment123";
      const userId = "user123";

      const mockComment = {
        id: commentId,
        content: "삭제할 댓글",
        userId,
      };

      mockCommentFindUnique.mockResolvedValue(mockComment);
      mockCommentDelete.mockResolvedValue({});

      // When & Then
      await expect(deleteComment(commentId, userId)).resolves.not.toThrow();

      expect(mockCommentFindUnique).toHaveBeenCalledWith({
        where: { id: commentId },
      });

      expect(mockCommentDelete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });

    // Promise를 반환하는 비동기 테스트
    it("존재하지 않는 댓글을 삭제하려고 할 때 에러를 발생시켜야 함", () => {
      // Given
      mockCommentFindUnique.mockResolvedValue(null);

      // When & Then
      return expect(deleteComment("nonexistent", "user123")).rejects.toThrow(
        "댓글을 찾을 수 없습니다."
      );
    });
  });
});
