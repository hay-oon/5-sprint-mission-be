import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 게시글 생성
const createArticle = async (title, content, userId) => {
  const article = await prisma.article.create({
    data: {
      title,
      content,
      userId,
      favoriteCount: 0,
    },
  });

  // 사용자 정보 별도로 조회
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nickname: true,
    },
  });

  return {
    id: article.id,
    title: article.title,
    content: article.content,
    favoriteCount: article.favoriteCount,
    image: null, // 프론트엔드에서 필요한 이미지 필드 추가
    writer: {
      id: user.id,
      nickname: user.nickname,
    },
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
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

  const articles = await prisma.article.findMany({
    where,
    orderBy,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  // 게시글 작성자 정보 조회
  const userIds = [...new Set(articles.map((article) => article.userId))];
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      nickname: true,
    },
  });

  // 사용자 ID를 키로 하는 매핑 생성
  const userMap = new Map();
  users.forEach((user) => {
    userMap.set(user.id, user);
  });

  // 사용자가 로그인한 경우 각 게시글에 대한 좋아요 상태 확인
  let articlesWithLikeStatus = articles;
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

    articlesWithLikeStatus = articles.map((article) => {
      const writer = userMap.get(article.userId);
      return {
        id: article.id,
        title: article.title,
        content: article.content,
        favoriteCount: article.favoriteCount,
        image: null, // 프론트엔드에서 필요한 이미지 필드 추가
        writer: writer
          ? {
              id: writer.id,
              nickname: writer.nickname,
            }
          : null,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        isFavorite: favoriteArticleIds.has(article.id),
      };
    });
  } else {
    // 로그인하지 않은 사용자는 모든 게시글을 좋아요하지 않은 상태로 표시
    articlesWithLikeStatus = articles.map((article) => {
      const writer = userMap.get(article.userId);
      return {
        id: article.id,
        title: article.title,
        content: article.content,
        favoriteCount: article.favoriteCount,
        image: null, // 프론트엔드에서 필요한 이미지 필드 추가
        writer: writer
          ? {
              id: writer.id,
              nickname: writer.nickname,
            }
          : null,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        isFavorite: false,
      };
    });
  }

  const total = await prisma.article.count({ where });
  return {
    totalCount: total,
    articles: articlesWithLikeStatus,
  };
};

// 게시글 상세 조회
const getArticleById = async (id, userId = null) => {
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) return null;

  // 작성자 정보 조회
  const user = await prisma.user.findUnique({
    where: { id: article.userId },
    select: {
      id: true,
      nickname: true,
    },
  });

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

  return {
    id: article.id,
    title: article.title,
    content: article.content,
    favoriteCount: article.favoriteCount,
    image: null,
    writer: user
      ? {
          id: user.id,
          nickname: user.nickname,
        }
      : null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    isFavorite,
  };
};

// 게시글 수정
const updateArticle = async (id, title, content, userId = null) => {
  const updatedArticle = await prisma.article.update({
    where: { id },
    data: {
      title,
      content,
    },
  });

  // 작성자 정보 조회
  const user = await prisma.user.findUnique({
    where: { id: updatedArticle.userId },
    select: {
      id: true,
      nickname: true,
    },
  });

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

  return {
    id: updatedArticle.id,
    title: updatedArticle.title,
    content: updatedArticle.content,
    favoriteCount: updatedArticle.favoriteCount,
    image: null, // 프론트엔드에서 필요한 이미지 필드
    writer: user
      ? {
          id: user.id,
          nickname: user.nickname,
        }
      : null,
    createdAt: updatedArticle.createdAt,
    updatedAt: updatedArticle.updatedAt,
    isFavorite,
  };
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
    });

    // 작성자 정보 조회
    const user = await tx.user.findUnique({
      where: { id: updatedArticle.userId },
      select: {
        id: true,
        nickname: true,
      },
    });

    return {
      id: updatedArticle.id,
      title: updatedArticle.title,
      content: updatedArticle.content,
      favoriteCount: updatedArticle.favoriteCount,
      image: null, // 프론트엔드에서 필요한 이미지 필드
      writer: user
        ? {
            id: user.id,
            nickname: user.nickname,
          }
        : null,
      createdAt: updatedArticle.createdAt,
      updatedAt: updatedArticle.updatedAt,
      isFavorite: true,
    };
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
    });

    // 작성자 정보 조회
    const user = await tx.user.findUnique({
      where: { id: updatedArticle.userId },
      select: {
        id: true,
        nickname: true,
      },
    });

    return {
      id: updatedArticle.id,
      title: updatedArticle.title,
      content: updatedArticle.content,
      favoriteCount: updatedArticle.favoriteCount,
      image: null, // 프론트엔드에서 필요한 이미지 필드
      writer: user
        ? {
            id: user.id,
            nickname: user.nickname,
          }
        : null,
      createdAt: updatedArticle.createdAt,
      updatedAt: updatedArticle.updatedAt,
      isFavorite: false,
    };
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
