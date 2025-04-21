import { PrismaClient, Prisma } from "@prisma/client";
import { ProductResponse } from "../../types/models";
import {
  createProductResponseDto,
  attachFavoriteStatus,
} from "../../utils/formatters";

const prisma = new PrismaClient();

const createProduct = async (
  name: string,
  description: string,
  price: number,
  tags: string[],
  images: string[],
  userId: string
): Promise<ProductResponse> => {
  console.log("Creating product for user ID:", userId);

  // userId로 사용자 정보 직접 조회
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nickname: true,
    },
  });

  if (!user) {
    throw new Error("유효하지 않은 사용자입니다.");
  }

  console.log("Found user:", user);

  // 상품 생성
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      tags,
      images,
      userId,
      favoriteCount: 0,
    },
  });

  // 응답 객체 생성 및 반환
  return createProductResponseDto(product, user, false);
};

const getProducts = async (
  page = 1,
  pageSize = 10,
  orderBy = "recent",
  keyword?: string,
  userId: string | null = null
): Promise<{ list: ProductResponse[]; totalCount: number }> => {
  // 정렬 조건 설정
  const orderByClause =
    orderBy === "recent"
      ? { createdAt: "desc" as Prisma.SortOrder }
      : { favoriteCount: "desc" as Prisma.SortOrder };

  // 검색 조건 설정
  const where: Prisma.ProductWhereInput = {};
  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      tags: true,
      images: true,
      createdAt: true,
      updatedAt: true,
      favoriteCount: true,
      userId: true,
    },
    orderBy: orderByClause,
    skip: (Number(page) - 1) * Number(pageSize),
    take: Number(pageSize),
  });

  // 유효한 사용자 ID만 필터링 (문자열 "undefined"인 ID 제외)
  const validUserIds = [
    ...new Set(
      products
        .map((product) => product.userId)
        .filter((id) => id && id !== "undefined")
    ),
  ];

  console.log("Valid user IDs for products:", validUserIds);

  // 사용자 정보 조회
  const users = await prisma.user.findMany({
    where: {
      id: { in: validUserIds },
    },
    select: {
      id: true,
      nickname: true,
    },
  });

  const userMap = users.reduce<
    Record<string, { id: string; nickname: string }>
  >((map, user) => {
    map[user.id] = user;
    return map;
  }, {});

  // 사용자가 로그인한 경우 각 제품에 대한 좋아요 상태 확인
  let productsWithDetails: ProductResponse[] = [];

  // 기본 제품 정보 생성
  productsWithDetails = products.map((product) => {
    // 소유자 정보가 유효한지 확인하고, 유효하지 않으면 Unknown User
    const ownerNickname =
      product.userId &&
      product.userId !== "undefined" &&
      userMap[product.userId]
        ? userMap[product.userId].nickname
        : "Unknown User";

    const ownerInfo =
      product.userId && userMap[product.userId]
        ? userMap[product.userId]
        : { id: product.userId, nickname: ownerNickname };

    return createProductResponseDto(product, ownerInfo, false);
  });

  // 사용자가 로그인한 경우 좋아요 상태 추가
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
    productsWithDetails = attachFavoriteStatus(
      productsWithDetails,
      favoriteProductIds
    );
  }

  const total = await prisma.product.count({ where });

  return {
    list: productsWithDetails,
    totalCount: total,
  };
};

const getProductById = async (
  id: string,
  userId: string | null = null
): Promise<ProductResponse | null> => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      tags: true,
      images: true,
      createdAt: true,
      updatedAt: true,
      favoriteCount: true,
      userId: true,
    },
  });

  if (!product) return null;

  console.log("Product owner ID:", product.userId);

  let ownerInfo = { id: product.userId, nickname: "Unknown User" };

  // userId가 "undefined" 문자열이 아닌 경우에만 사용자 정보 조회
  if (product.userId && product.userId !== "undefined") {
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: product.userId },
      select: {
        id: true,
        nickname: true,
      },
    });

    // 사용자 정보가 있으면 사용
    if (user) {
      ownerInfo = user;
    }
  } else {
    console.log("Product has invalid owner ID:", product.userId);
  }

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

  // 응답 객체 생성 및 반환
  return createProductResponseDto(product, ownerInfo, isFavorite);
};

const updateProduct = async (
  id: string,
  name: string,
  description: string,
  price: number,
  tags: string[],
  images: string[],
  userId: string
): Promise<ProductResponse> => {
  console.log("Update product request: ", { id, userId });

  // 상품 존재 여부 확인 - 모든 필드를 명시적으로 선택
  const productCheck = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      description: true,
      price: true,
      tags: true,
      images: true,
      createdAt: true,
      updatedAt: true,
      favoriteCount: true,
    },
  });

  if (!productCheck) {
    throw new Error("상품을 찾을 수 없습니다.");
  }

  console.log("Product details:", productCheck);
  console.log("Product owner check: ", {
    productUserId: productCheck.userId,
    requestUserId: userId,
    isMatch: productCheck.userId === userId,
  });

  // 현재 사용자가 작성자인지 확인
  // userId가 "undefined" 문자열인 경우 특별 처리
  if (productCheck.userId !== userId && productCheck.userId !== "undefined") {
    throw new Error("상품을 수정할 권한이 없습니다.");
  }

  // 상품 업데이트 - userId도 함께 업데이트
  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      tags,
      images,
      // "undefined" 문자열이었던 경우 현재 사용자 ID로 업데이트
      userId:
        productCheck.userId === "undefined" ? userId : productCheck.userId,
    },
  });

  // 사용자 정보 조회
  const user = await prisma.user.findUnique({
    where: { id: product.userId },
    select: {
      id: true,
      nickname: true,
    },
  });

  // user가 null일 경우 기본값 제공
  const ownerInfo = user || { id: product.userId, nickname: "Unknown User" };

  // 좋아요 상태 확인
  const favorite = await prisma.favorite.findFirst({
    where: {
      userId,
      productId: id,
    },
  });
  const isFavorite = !!favorite;

  // 응답 객체 생성 및 반환
  return createProductResponseDto(product, ownerInfo, isFavorite);
};

const deleteProduct = async (
  id: string,
  userId: string
): Promise<ProductResponse> => {
  // 삭제 전에 상품 정보 저장
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      tags: true,
      images: true,
      createdAt: true,
      updatedAt: true,
      favoriteCount: true,
      userId: true,
    },
  });

  if (!product) {
    throw new Error("상품을 찾을 수 없습니다.");
  }

  console.log("Delete product owner check: ", {
    productUserId: product.userId,
    requestUserId: userId,
    isMatch: product.userId === userId,
  });

  // 현재 사용자가 작성자인지 확인
  // userId가 "undefined" 문자열인 경우 특별 처리
  if (product.userId !== userId && product.userId !== "undefined") {
    throw new Error("상품을 삭제할 권한이 없습니다.");
  }

  // 사용자 정보 조회
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nickname: true,
    },
  });

  // user가 null일 경우 기본값 제공
  const ownerInfo = user || { id: product.userId, nickname: "Unknown User" };

  // 상품 삭제
  await prisma.product.delete({
    where: { id },
  });

  // 응답 객체 생성 및 반환
  return createProductResponseDto(product, ownerInfo, false); // 삭제된 상품이므로 좋아요 상태는 항상 false
};

// 제품에 좋아요 추가
const addFavorite = async (
  productId: string,
  userId: string
): Promise<ProductResponse> => {
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
        name: true,
        description: true,
        price: true,
        tags: true,
        images: true,
        createdAt: true,
        updatedAt: true,
        favoriteCount: true,
        userId: true,
      },
    });

    // 사용자 정보 조회
    const user = await tx.user.findUnique({
      where: { id: updatedProduct.userId },
      select: {
        id: true,
        nickname: true,
      },
    });

    // user가 null일 경우 기본값 제공
    const ownerInfo = user || {
      id: updatedProduct.userId,
      nickname: "Unknown User",
    };

    return createProductResponseDto(updatedProduct, ownerInfo, true);
  });
};

// 제품 좋아요 취소
const removeFavorite = async (
  productId: string,
  userId: string
): Promise<ProductResponse> => {
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
        name: true,
        description: true,
        price: true,
        tags: true,
        images: true,
        createdAt: true,
        updatedAt: true,
        favoriteCount: true,
        userId: true,
      },
    });

    // 사용자 정보 조회
    const user = await tx.user.findUnique({
      where: { id: updatedProduct.userId },
      select: {
        id: true,
        nickname: true,
      },
    });

    // user가 null일 경우 기본값 제공
    const ownerInfo = user || {
      id: updatedProduct.userId,
      nickname: "Unknown User",
    };

    return createProductResponseDto(updatedProduct, ownerInfo, false);
  });
};

// 사용자가 제품에 좋아요를 눌렀는지 확인
const checkFavorite = async (
  productId: string,
  userId: string
): Promise<boolean> => {
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
