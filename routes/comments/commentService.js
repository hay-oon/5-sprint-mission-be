import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createArticleComment = async (content, articleId) => {
  return await prisma.comment.create({
    data: {
      content,
      articleId,
    },
    include: {
      article: true,
    },
  });
};

const createProductComment = async (content, productId) => {
  return await prisma.comment.create({
    data: {
      content,
      productId,
    },
    include: {
      product: true,
    },
  });
};

const getArticleComments = async (articleId, cursor) => {
  const comments = await prisma.comment.findMany({
    where: { articleId },
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
    take: 10,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: "desc" },
  });

  return {
    comments,
    nextCursor:
      comments.length === 10 ? comments[comments.length - 1].id : null,
  };
};

const getProductComments = async (productId, cursor) => {
  const comments = await prisma.comment.findMany({
    where: { productId },
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
    take: 10,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: "desc" },
  });

  return {
    comments,
    nextCursor:
      comments.length === 10 ? comments[comments.length - 1].id : null,
  };
};

const updateComment = async (id, content) => {
  return await prisma.comment.update({
    where: { id },
    data: { content },
  });
};

const deleteComment = async (id) => {
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
