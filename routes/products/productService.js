import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createProduct = async (name, description, price, tags, userId) => {
  return await prisma.product.create({
    data: {
      name,
      description,
      price,
      tags,
      userId,
      favoriteCount: 0,
    },
  });
};

const getProducts = async (page = 1, pageSize = 10, keyword, userId = null) => {
  const where = keyword
    ? {
        OR: [
          { name: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (Number(page) - 1) * Number(pageSize),
    take: Number(pageSize),
  });

  // 사용자가 로그인한 경우 각 제품에 대한 좋아요 상태 확인
  let productsWithFavoriteStatus = products;
  if (userId) {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        productId: { in: products.map((product) => product.id) },
      },
      select: {
        productId: true,
      },
    });

    const favoriteProductIds = new Set(favorites.map((fav) => fav.productId));

    productsWithFavoriteStatus = products.map((product) => ({
      ...product,
      isFavorite: favoriteProductIds.has(product.id),
    }));
  } else {
    // 로그인하지 않은 사용자는 모든 제품을 좋아요하지 않은 상태로 표시
    productsWithFavoriteStatus = products.map((product) => ({
      ...product,
      isFavorite: false,
    }));
  }

  const total = await prisma.product.count({ where });

  return {
    products: productsWithFavoriteStatus,
    total,
    totalPages: Math.ceil(total / Number(pageSize)),
    currentPage: Number(page),
  };
};

const getProductById = async (id, userId = null) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      tags: true,
      createdAt: true,
    },
  });

  if (!product) return null;

  // 사용자가 로그인한 경우 좋아요 상태 확인
  let isFavorite = false;
  if (userId) {
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        productId: id,
      },
    });
    isFavorite = !!favorite;
  }

  // 좋아요 상태를 제품 정보에 추가
  return {
    ...product,
    isFavorite,
  };
};

const updateProduct = async (id, name, description, price, tags) => {
  return await prisma.product.update({
    where: { id },
    data: { name, description, price, tags },
  });
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id },
  });
};

// 제품에 좋아요 추가
const addFavorite = async (productId, userId) => {
  // 트랜잭션 사용
  return await prisma.$transaction(async (tx) => {
    // 좋아요 생성
    await tx.favorite.create({
      data: {
        userId,
        productId,
      },
    });

    // 좋아요 카운트 증가
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { favoriteCount: { increment: 1 } },
      select: {
        id: true,
        favoriteCount: true,
      },
    });

    return updatedProduct;
  });
};

// 제품 좋아요 취소
const removeFavorite = async (productId, userId) => {
  // 트랜잭션 사용
  return await prisma.$transaction(async (tx) => {
    // 좋아요 삭제
    await tx.favorite.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    // 좋아요 카운트 감소
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { favoriteCount: { decrement: 1 } },
      select: {
        id: true,
        favoriteCount: true,
      },
    });

    return updatedProduct;
  });
};

// 사용자가 제품에 좋아요를 눌렀는지 확인
const checkFavorite = async (productId, userId) => {
  const favorite = await prisma.favorite.findFirst({
    where: {
      userId,
      productId,
    },
  });

  return !!favorite; // 좋아요가 있으면 true, 없으면 false
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
  checkFavorite,
};
