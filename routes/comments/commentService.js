import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createArticleComment = async (content, articleId, userId) => {
  const comment = await prisma.comment.create({
    data: {
      content,
      articleId,
      userId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          image: true,
        },
      },
    },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    writer: {
      id: comment.user.id,
      nickname: comment.user.nickname,
      image: comment.user.image,
    },
  };
};

const createProductComment = async (content, productId, userId) => {
  const comment = await prisma.comment.create({
    data: {
      content,
      productId,
      userId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          image: true,
        },
      },
    },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    writer: {
      id: comment.user.id,
      nickname: comment.user.nickname,
      image: comment.user.image,
    },
  };
};

const getArticleComments = async (articleId, cursor, limit = 10) => {
  const comments = await prisma.comment.findMany({
    where: { articleId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          image: true,
        },
      },
    },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: "desc" },
  });

  const formattedComments = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    writer: {
      id: comment.user.id,
      nickname: comment.user.nickname,
      image: comment.user.image,
    },
  }));

  return {
    comments: formattedComments,
    nextCursor:
      comments.length === limit ? comments[comments.length - 1].id : null,
  };
};

const getProductComments = async (productId, cursor, limit = 10) => {
  const comments = await prisma.comment.findMany({
    where: { productId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          image: true,
        },
      },
    },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: "desc" },
  });

  const formattedComments = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    writer: {
      id: comment.user.id,
      nickname: comment.user.nickname,
      image: comment.user.image,
    },
  }));

  return {
    list: formattedComments,
    nextCursor:
      comments.length === limit ? comments[comments.length - 1].id : null,
  };
};

const updateComment = async (id, content, userId) => {
  // 댓글 작성자 확인
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  if (comment.userId !== userId) {
    throw new Error("댓글을 수정할 권한이 없습니다.");
  }

  const updatedComment = await prisma.comment.update({
    where: { id },
    data: { content },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          image: true,
        },
      },
    },
  });

  return {
    id: updatedComment.id,
    content: updatedComment.content,
    createdAt: updatedComment.createdAt,
    updatedAt: updatedComment.updatedAt,
    writer: {
      id: updatedComment.user.id,
      nickname: updatedComment.user.nickname,
      image: updatedComment.user.image,
    },
  };
};

const deleteComment = async (id, userId) => {
  // 댓글 작성자 확인
  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!comment) {
    throw new Error("댓글을 찾을 수 없습니다.");
  }

  if (comment.userId !== userId) {
    throw new Error("댓글을 삭제할 권한이 없습니다.");
  }

  return await prisma.comment.delete({ where: { id } });
};

export {
  createArticleComment,
  createProductComment,
  getArticleComments,
  getProductComments,
  updateComment,
  deleteComment,
};
