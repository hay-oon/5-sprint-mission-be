import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 게시글 등록
const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    const article = await prisma.article.create({
      data: {
        title,
        content,
      },
    });

    res.status(201).send(article);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 게시글 목록 조회
const getArticles = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;

    // 검색 조건 설정
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

    res.status(200).send({
      articles,
      total,
      totalPages: Math.ceil(total / Number(pageSize)),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 게시글 상세 조회
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
    });

    if (!article) {
      return res.status(404).send({ message: "Article not found" });
    }

    res.status(200).send(article);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 게시글 수정
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    res.status(200).send(article);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Article not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

// 게시글 삭제
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.article.delete({
      where: { id },
    });

    res.status(200).send({ message: "Article deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Article not found" });
    }
    res.status(500).send({ message: err.message });
  }
  xj;
};

export {
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticles,
};
