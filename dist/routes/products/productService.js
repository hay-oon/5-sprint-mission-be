import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// user가 null인지 확인하는 유틸리티 함수
function ensureUser(user) {
    if (!user) {
        throw new Error("사용자 정보가 필요합니다.");
    }
    return { id: String(user.id), nickname: user.nickname };
}
const createProduct = async (name, description, price, tags, images, userId) => {
    // user가 null이 아님을 확인
    const userInfo = ensureUser(userId);
    // 상품 생성
    const product = await prisma.product.create({
        data: {
            name,
            description,
            price,
            tags,
            images,
            userId: userInfo.id,
            favoriteCount: 0,
        },
    });
    // 응답 예시에 맞는 형식으로 반환
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        tags: product.tags,
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        favoriteCount: product.favoriteCount,
        ownerId: userInfo.id,
        ownerNickname: userInfo.nickname,
        isFavorite: false,
    };
};
const getProducts = async (page = 1, pageSize = 10, orderBy = "recent", keyword, userId = null) => {
    // 정렬 조건 설정
    const orderByClause = orderBy === "recent"
        ? { createdAt: "desc" }
        : { favoriteCount: "desc" };
    // 검색 조건 설정
    const where = {};
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
    // 사용자 정보 조회
    const userIds = [...new Set(products.map((product) => product.userId))];
    const users = await prisma.user.findMany({
        where: {
            id: { in: userIds },
        },
        select: {
            id: true,
            nickname: true,
        },
    });
    const userMap = users.reduce((map, user) => {
        map[user.id] = user;
        return map;
    }, {});
    // 사용자가 로그인한 경우 각 제품에 대한 좋아요 상태 확인
    let productsWithDetails = [];
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
        productsWithDetails = products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            tags: product.tags,
            images: product.images,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            favoriteCount: product.favoriteCount,
            ownerId: product.userId,
            ownerNickname: userMap[product.userId]?.nickname || "",
            isFavorite: favoriteProductIds.has(product.id),
        }));
    }
    else {
        // 로그인하지 않은 사용자
        productsWithDetails = products.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            tags: product.tags,
            images: product.images,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            favoriteCount: product.favoriteCount,
            ownerId: product.userId,
            ownerNickname: userMap[product.userId]?.nickname || "",
            isFavorite: false,
        }));
    }
    const total = await prisma.product.count({ where });
    return {
        list: productsWithDetails,
        totalCount: total,
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
            images: true,
            createdAt: true,
            updatedAt: true,
            favoriteCount: true,
            userId: true,
        },
    });
    if (!product)
        return null;
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
    // 응답 예시에 맞는 형식으로 반환
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        tags: product.tags,
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        favoriteCount: product.favoriteCount,
        ownerId: ownerInfo.id,
        ownerNickname: ownerInfo.nickname,
        isFavorite,
    };
};
const updateProduct = async (id, name, description, price, tags, images, userId) => {
    // 상품 존재 여부 및 소유권 확인
    const productCheck = await prisma.product.findUnique({
        where: { id },
    });
    if (!productCheck) {
        throw new Error("상품을 찾을 수 없습니다.");
    }
    // 현재 사용자가 작성자인지 확인 (문자열로 변환하여 비교)
    if (String(productCheck.userId) !== String(userId)) {
        console.log(`소유자 ID: ${productCheck.userId}, 요청자 ID: ${userId}`);
        throw new Error("상품을 수정할 권한이 없습니다.");
    }
    // 상품 업데이트
    const product = await prisma.product.update({
        where: { id },
        data: {
            name,
            description,
            price,
            tags,
            images,
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
    // 응답 예시에 맞는 형식으로 반환
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        tags: product.tags,
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        favoriteCount: product.favoriteCount,
        ownerId: ownerInfo.id,
        ownerNickname: ownerInfo.nickname,
        isFavorite,
    };
};
const deleteProduct = async (id, userId) => {
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
    // 현재 사용자가 작성자인지 확인 (문자열로 변환하여 비교)
    if (String(product.userId) !== String(userId)) {
        console.log(`소유자 ID: ${product.userId}, 요청자 ID: ${userId}`);
        throw new Error("상품을 삭제할 권한이 없습니다.");
    }
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
    // 상품 삭제
    await prisma.product.delete({
        where: { id },
    });
    // 응답 예시에 맞는 형식으로 반환
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        tags: product.tags,
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        favoriteCount: product.favoriteCount,
        ownerId: ownerInfo.id,
        ownerNickname: ownerInfo.nickname,
        isFavorite: false, // 삭제된 상품이므로 좋아요 상태는 항상 false
    };
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
        return {
            id: updatedProduct.id,
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: updatedProduct.price,
            tags: updatedProduct.tags,
            images: updatedProduct.images,
            createdAt: updatedProduct.createdAt,
            updatedAt: updatedProduct.updatedAt,
            favoriteCount: updatedProduct.favoriteCount,
            ownerId: ownerInfo.id,
            ownerNickname: ownerInfo.nickname,
            isFavorite: true,
        };
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
        return {
            id: updatedProduct.id,
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: updatedProduct.price,
            tags: updatedProduct.tags,
            images: updatedProduct.images,
            createdAt: updatedProduct.createdAt,
            updatedAt: updatedProduct.updatedAt,
            favoriteCount: updatedProduct.favoriteCount,
            ownerId: ownerInfo.id,
            ownerNickname: ownerInfo.nickname,
            isFavorite: false,
        };
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
export { createProduct, getProducts, getProductById, updateProduct, deleteProduct, addFavorite, removeFavorite, checkFavorite, };
