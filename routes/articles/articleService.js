import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 게시글 생성
const createArticle = async (title, content, userId) => {
  return await prisma.article.create({
    data: {
      title,
      content,
      userId,
      favoriteCount: 0,
    },
  });
};

// 게시글 목록 조회
const getArticles = async (
  page = 1,
  limit = 10,
  keyword,
  sortBy = "latest",
  userId = null
) => {
  const where = keyword
    ? {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { content: { contains: keyword, mode: "insensitive" } },
        ],
      }
    : {};

  const orderBy =
    sortBy === "likes" ? { favoriteCount: "desc" } : { createdAt: "desc" };

  // const orderBy = {};
  // switch (sortBy) {
  //   case "likes":
  //     orderBy.likeCount = "desc";
  //     break;
  //   default:
  //     orderBy.createdAt = "desc";
  // }

  const articles = await prisma.article.findMany({
    where,
    select: {
      id: true,
      title: true,
      content: true,
      favoriteCount: true,
      createdAt: true,
    },
    orderBy,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  // 사용자가 로그인한 경우 각 게시글에 대한 좋아요 상태 확인
  let articlesWithFavoriteStatus = articles;
  if (userId) {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        articleId: { in: articles.map((article) => article.id) },
      },
      select: {
        articleId: true,
      },
    });

    const favoriteArticleIds = new Set(favorites.map((fav) => fav.articleId));

    articlesWithFavoriteStatus = articles.map((article) => ({
      ...article,
      isFavorite: favoriteArticleIds.has(article.id),
    }));
  } else {
    // 로그인하지 않은 사용자는 모든 게시글을 좋아요하지 않은 상태로 표시
    articlesWithFavoriteStatus = articles.map((article) => ({
      ...article,
      isFavorite: false,
    }));
  }

  const total = await prisma.article.count({ where });
  return {
    articles: articlesWithFavoriteStatus,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
  };
};

// 게시글 상세 조회
const getArticleById = async (id, userId = null) => {
  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      favoriteCount: true,
      createdAt: true,
    },
  });

  if (!article) return null;

  // 사용자가 로그인한 경우 좋아요 상태 확인
  let isFavorite = false;
  if (userId) {
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        articleId: id,
      },
    });
    isFavorite = !!favorite;
  }

  // 좋아요 상태를 게시글 정보에 추가
  return {
    ...article,
    isFavorite,
  };
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

// 게시글에 좋아요 추가
const addFavorite = async (articleId, userId) => {
  // 트랜잭션 사용
  return await prisma.$transaction(async (tx) => {
    // 좋아요 생성
    await tx.favorite.create({
      data: {
        userId,
        articleId,
      },
    });

    // 좋아요 카운트 증가
    const updatedArticle = await tx.article.update({
      where: { id: articleId },
      data: { favoriteCount: { increment: 1 } },
      select: {
        id: true,
        favoriteCount: true,
      },
    });

    return updatedArticle;
  });
};

// 게시글 좋아요 취소
const removeFavorite = async (articleId, userId) => {
  // 트랜잭션 사용
  return await prisma.$transaction(async (tx) => {
    // 좋아요 삭제
    await tx.favorite.deleteMany({
      where: {
        userId,
        articleId,
      },
    });

    // 좋아요 카운트 감소
    const updatedArticle = await tx.article.update({
      where: { id: articleId },
      data: { favoriteCount: { decrement: 1 } },
      select: {
        id: true,
        favoriteCount: true,
      },
    });

    return updatedArticle;
  });
};

// 사용자가 게시글에 좋아요를 눌렀는지 확인
const checkFavorite = async (articleId, userId) => {
  const favorite = await prisma.favorite.findFirst({
    where: {
      userId,
      articleId,
    },
  });

  return !!favorite; // 좋아요가 있으면 true, 없으면 false
};

export {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  addFavorite,
  removeFavorite,
  checkFavorite,
};
