import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 게시글 생성
const createArticle = async (title, content) => {
  return await prisma.article.create({
    data: {
      title,
      content,
    },
  });
};

// 게시글 목록 조회
const getArticles = async (page = 1, pageSize = 10, keyword) => {
  const where = keyword
    ? {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { content: { contains: keyword, mode: "insensitive" } },
        ],
      }
    : {};

  const articles = await prisma.article.findMany({
    where,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (Number(page) - 1) * Number(pageSize),
    take: Number(pageSize),
  });

  const total = await prisma.article.count({ where });

  return {
    articles,
    total,
    totalPages: Math.ceil(total / Number(pageSize)),
    currentPage: Number(page),
  };
};

// 게시글 상세 조회
const getArticleById = async (id) => {
  return await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
    },
  });
};

// 게시글 수정
const updateArticle = async (id, title, content) => {
  return await prisma.article.update({
    where: { id },
    data: {
      title,
      content,
    },
  });
};

// 게시글 삭제
const deleteArticle = async (id) => {
  return await prisma.article.delete({
    where: { id },
  });
};

export {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};
