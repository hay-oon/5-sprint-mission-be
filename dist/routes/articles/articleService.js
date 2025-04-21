import { PrismaClient } from "@prisma/client";
import { createSearchCondition, createPaginationParams, } from "../../utils/prismaHelpers.js";
import { createArticleResponseDto, attachFavoriteStatus, } from "../../utils/formatters.js";
import { checkResourceExists, verifyPermission, } from "../../utils/authHelpers.js";
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
    return createArticleResponseDto(article, user, false);
};
// 게시글 목록 조회
const getArticles = async (page, limit, keyword, sortBy = "latest", userId = null) => {
    // 기본값 설정
    const pageNum = page || 1;
    const limitNum = limit || 10;
    // 검색 조건 생성
    const where = createSearchCondition(keyword, [
        "title",
        "content",
    ]);
    // 정렬 조건 생성
    const orderBy = sortBy === "likes"
        ? { favoriteCount: "desc" }
        : { createdAt: "desc" };
    // 페이지네이션 파라미터 생성
    const { skip, take } = createPaginationParams(pageNum, limitNum);
    // 게시글 조회
    const articles = await prisma.article.findMany({
        where,
        orderBy,
        skip,
        take,
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
    // 기본 게시글 데이터 처리
    let formattedArticles = articles.map((article) => {
        const writer = userMap.get(article.userId);
        return {
            ...article,
            writer: writer
                ? {
                    id: writer.id,
                    nickname: writer.nickname || null,
                }
                : null,
            isFavorite: false,
        };
    });
    // 사용자가 로그인한 경우 각 게시글에 대한 좋아요 상태 확인
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
        // null 값이 포함되지 않도록 필터링하여 Set 생성
        const favoriteArticleIds = new Set(favorites.map((fav) => fav.articleId).filter(Boolean));
        formattedArticles = attachFavoriteStatus(formattedArticles, favoriteArticleIds);
    }
    const total = await prisma.article.count({ where });
    return {
        totalCount: total,
        articles: formattedArticles,
    };
};
// 게시글 상세 조회
const getArticleById = async (id, userId = null) => {
    const article = await prisma.article.findUnique({
        where: { id },
    });
    if (!article)
        return null;
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
    return createArticleResponseDto(article, user, isFavorite);
};
// 게시글 수정
const updateArticle = async (id, title, content, userId = null) => {
    // 게시글 존재 여부 및 소유권 확인
    const article = await prisma.article.findUnique({
        where: { id },
    });
    // userId가 null이 아닌 경우에만 권한 검증 수행
    if (userId !== null) {
        verifyPermission(article, userId, "userId", "게시글");
    }
    else {
        // userId가 null인 경우 리소스 존재 여부만 확인
        checkResourceExists(article, "게시글");
    }
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
    return createArticleResponseDto(updatedArticle, user, isFavorite);
};
// 게시글 삭제
const deleteArticle = async (id, userId) => {
    // 게시글 존재 여부 및 소유권 확인
    const article = await prisma.article.findUnique({
        where: { id },
    });
    // 권한 검증 (존재 여부, 인증, 소유권)
    verifyPermission(article, userId, "userId", "게시글");
    return await prisma.article.delete({
        where: { id },
    });
};
// 게시글에 좋아요 추가
const addFavorite = async (articleId, userId) => {
    // 트랜잭션 사용
    return await prisma.$transaction(async (tx) => {
        // 게시글 존재 여부 확인
        const article = await tx.article.findUnique({
            where: { id: articleId },
        });
        checkResourceExists(article, "게시글");
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
        return createArticleResponseDto(updatedArticle, user, true);
    });
};
// 게시글 좋아요 취소
const removeFavorite = async (articleId, userId) => {
    // 트랜잭션 사용
    return await prisma.$transaction(async (tx) => {
        // 게시글 존재 여부 확인
        const article = await tx.article.findUnique({
            where: { id: articleId },
        });
        checkResourceExists(article, "게시글");
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
        return createArticleResponseDto(updatedArticle, user, false);
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
export { createArticle, getArticles, getArticleById, updateArticle, deleteArticle, addFavorite, removeFavorite, checkFavorite, };
