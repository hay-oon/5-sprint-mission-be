import { db } from "../../prisma/index.js";
import { notFoundError, forbiddenError } from "../../utils/errorHandler.js";

interface CommentResult {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    nickname: string;
  };
}

interface CommentsResult {
  comments: CommentResult[];
  nextCursor: string | null;
}

export const createArticleComment = async (
  content: string,
  articleId: string,
  userId: string | number
): Promise<CommentResult> => {
  const article = await db.article.findUnique({
    where: { id: articleId },
  });

  if (!article) {
    throw notFoundError("게시글을 찾을 수 없습니다.");
  }

  return db.comment.create({
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
};

export const createProductComment = async (
  content: string,
  productId: string,
  userId: string | number
): Promise<CommentResult> => {
  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw notFoundError("상품을 찾을 수 없습니다.");
  }

  return db.comment.create({
    data: {
      content,
      userId: String(userId),
      productId,
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
};

export const getArticleComments = async (
  articleId: string,
  cursor?: string,
  limit: number = 10
): Promise<CommentsResult> => {
  const article = await db.article.findUnique({
    where: { id: articleId },
  });

  if (!article) {
    throw notFoundError("게시글을 찾을 수 없습니다.");
  }

  const comments = await db.comment.findMany({
    where: {
      articleId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit + 1,
    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1,
    }),
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

  const hasNextPage = comments.length > limit;
  const nextCursor = hasNextPage ? comments.pop()?.id || null : null;

  return {
    comments,
    nextCursor,
  };
};

export const getProductComments = async (
  productId: string,
  cursor?: string,
  limit: number = 10
): Promise<CommentsResult> => {
  const product = await db.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw notFoundError("상품을 찾을 수 없습니다.");
  }

  const comments = await db.comment.findMany({
    where: {
      productId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit + 1,
    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1,
    }),
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

  const hasNextPage = comments.length > limit;
  const nextCursor = hasNextPage ? comments.pop()?.id || null : null;

  return {
    comments,
    nextCursor,
  };
};

export const updateComment = async (
  id: string,
  content: string,
  userId: string | number
): Promise<CommentResult> => {
  const comment = await db.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw notFoundError("댓글을 찾을 수 없습니다.");
  }

  if (comment.userId !== userId) {
    throw forbiddenError("댓글을 수정할 권한이 없습니다.");
  }

  return db.comment.update({
    where: { id },
    data: { content },
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
};

export const deleteComment = async (
  id: string,
  userId: string | number
): Promise<void> => {
  const comment = await db.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw notFoundError("댓글을 찾을 수 없습니다.");
  }

  if (comment.userId !== userId) {
    throw forbiddenError("댓글을 삭제할 권한이 없습니다.");
  }

  await db.comment.delete({
    where: { id },
  });
};
