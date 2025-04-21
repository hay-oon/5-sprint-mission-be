"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getProductComments = exports.getArticleComments = exports.createProductComment = exports.createArticleComment = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../../utils/errorHandler");
const prisma = new client_1.PrismaClient();
const createArticleComment = async (content, articleId, userId) => {
    const article = await prisma.article.findUnique({
        where: { id: articleId },
    });
    if (!article) {
        throw (0, errorHandler_1.notFoundError)("게시글을 찾을 수 없습니다.");
    }
    return prisma.comment.create({
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
exports.createArticleComment = createArticleComment;
const createProductComment = async (content, productId, userId) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw (0, errorHandler_1.notFoundError)("상품을 찾을 수 없습니다.");
    }
    return prisma.comment.create({
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
exports.createProductComment = createProductComment;
const getArticleComments = async (articleId, cursor, limit = 10) => {
    const article = await prisma.article.findUnique({
        where: { id: articleId },
    });
    if (!article) {
        throw (0, errorHandler_1.notFoundError)("게시글을 찾을 수 없습니다.");
    }
    const comments = await prisma.comment.findMany({
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
exports.getArticleComments = getArticleComments;
const getProductComments = async (productId, cursor, limit = 10) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw (0, errorHandler_1.notFoundError)("상품을 찾을 수 없습니다.");
    }
    const comments = await prisma.comment.findMany({
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
exports.getProductComments = getProductComments;
const updateComment = async (id, content, userId) => {
    const comment = await prisma.comment.findUnique({
        where: { id },
    });
    if (!comment) {
        throw (0, errorHandler_1.notFoundError)("댓글을 찾을 수 없습니다.");
    }
    if (comment.userId !== userId) {
        throw (0, errorHandler_1.forbiddenError)("댓글을 수정할 권한이 없습니다.");
    }
    return prisma.comment.update({
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
exports.updateComment = updateComment;
const deleteComment = async (id, userId) => {
    const comment = await prisma.comment.findUnique({
        where: { id },
    });
    if (!comment) {
        throw (0, errorHandler_1.notFoundError)("댓글을 찾을 수 없습니다.");
    }
    if (comment.userId !== userId) {
        throw (0, errorHandler_1.forbiddenError)("댓글을 삭제할 권한이 없습니다.");
    }
    await prisma.comment.delete({
        where: { id },
    });
};
exports.deleteComment = deleteComment;
