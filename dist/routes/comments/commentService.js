import { db } from "../../prisma/index.js";
import { notFoundError, forbiddenError } from "../../utils/errorHandler.js";
export const createArticleComment = async (content, articleId, userId) => {
    const article = await db.article.findUnique({
        where: { id: articleId },
    });
    if (!article) {
        throw notFoundError("게시글을 찾을 수 없습니다.");
    }
    return db.comment.create({
        data: {
            content,
            userId: String(userId),
            articleId,
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            user: {
                select: {
                    nickname: true,
                },
            },
        },
    });
};
export const createProductComment = async (content, productId, userId) => {
    const product = await db.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw notFoundError("상품을 찾을 수 없습니다.");
    }
    return db.comment.create({
        data: {
            content,
            userId: String(userId),
            productId,
        },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            user: {
                select: {
                    nickname: true,
                },
            },
        },
    });
};
export const getArticleComments = async (articleId, cursor, limit = 10) => {
    const article = await db.article.findUnique({
        where: { id: articleId },
    });
    if (!article) {
        throw notFoundError("게시글을 찾을 수 없습니다.");
    }
    const comments = await db.comment.findMany({
        where: {
            articleId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit + 1,
        ...(cursor && {
            cursor: {
                id: cursor,
            },
            skip: 1,
        }),
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            user: {
                select: {
                    nickname: true,
                },
            },
        },
    });
    const hasNextPage = comments.length > limit;
    const nextCursor = hasNextPage ? comments.pop()?.id || null : null;
    return {
        comments,
        nextCursor,
    };
};
export const getProductComments = async (productId, cursor, limit = 10) => {
    const product = await db.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw notFoundError("상품을 찾을 수 없습니다.");
    }
    const comments = await db.comment.findMany({
        where: {
            productId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit + 1,
        ...(cursor && {
            cursor: {
                id: cursor,
            },
            skip: 1,
        }),
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            user: {
                select: {
                    nickname: true,
                },
            },
        },
    });
    const hasNextPage = comments.length > limit;
    const nextCursor = hasNextPage ? comments.pop()?.id || null : null;
    return {
        comments,
        nextCursor,
    };
};
export const updateComment = async (id, content, userId) => {
    const comment = await db.comment.findUnique({
        where: { id },
    });
    if (!comment) {
        throw notFoundError("댓글을 찾을 수 없습니다.");
    }
    if (comment.userId !== userId) {
        throw forbiddenError("댓글을 수정할 권한이 없습니다.");
    }
    return db.comment.update({
        where: { id },
        data: { content },
        select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            user: {
                select: {
                    nickname: true,
                },
            },
        },
    });
};
export const deleteComment = async (id, userId) => {
    const comment = await db.comment.findUnique({
        where: { id },
    });
    if (!comment) {
        throw notFoundError("댓글을 찾을 수 없습니다.");
    }
    if (comment.userId !== userId) {
        throw forbiddenError("댓글을 삭제할 권한이 없습니다.");
    }
    await db.comment.delete({
        where: { id },
    });
};
