"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommentController = exports.updateCommentController = exports.getProductCommentsController = exports.getArticleCommentsController = exports.createProductCommentController = exports.createArticleCommentController = void 0;
const comment_service_1 = require("./comment.service");
const errorHandler_1 = require("../../utils/errorHandler");
const createArticleCommentController = async (req, res) => {
    try {
        const { content } = req.body;
        const { articleId } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요합니다." });
        }
        if (!content) {
            throw (0, errorHandler_1.badRequestError)("댓글 내용을 입력해주세요.");
        }
        const comment = await (0, comment_service_1.createArticleComment)(content, articleId, String(req.user.id));
        return res.status(201).json(comment);
    }
    catch (error) {
        if (error instanceof Error) {
            return res
                .status(400)
                .json({
                message: error instanceof Error ? error.message : "오류가 발생했습니다",
            });
        }
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.createArticleCommentController = createArticleCommentController;
const createProductCommentController = async (req, res) => {
    try {
        const { content } = req.body;
        const { productId } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요합니다." });
        }
        if (!content) {
            throw (0, errorHandler_1.badRequestError)("댓글 내용을 입력해주세요.");
        }
        const comment = await (0, comment_service_1.createProductComment)(content, productId, String(req.user.id));
        return res.status(201).json(comment);
    }
    catch (error) {
        if (error instanceof Error) {
            return res
                .status(400)
                .json({
                message: error instanceof Error ? error.message : "오류가 발생했습니다",
            });
        }
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.createProductCommentController = createProductCommentController;
const getArticleCommentsController = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { cursor } = req.query;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const comments = await (0, comment_service_1.getArticleComments)(articleId, cursor, limit);
        return res.status(200).json(comments);
    }
    catch (error) {
        if (error instanceof Error) {
            return res
                .status(400)
                .json({
                message: error instanceof Error ? error.message : "오류가 발생했습니다",
            });
        }
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.getArticleCommentsController = getArticleCommentsController;
const getProductCommentsController = async (req, res) => {
    try {
        const { productId } = req.params;
        const { cursor } = req.query;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const comments = await (0, comment_service_1.getProductComments)(productId, cursor, limit);
        return res.status(200).json(comments);
    }
    catch (error) {
        if (error instanceof Error) {
            return res
                .status(400)
                .json({
                message: error instanceof Error ? error.message : "오류가 발생했습니다",
            });
        }
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.getProductCommentsController = getProductCommentsController;
const updateCommentController = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!req.user) {
            throw (0, errorHandler_1.unauthorizedError)("로그인이 필요합니다.");
        }
        if (!content) {
            throw (0, errorHandler_1.badRequestError)("댓글 내용을 입력해주세요.");
        }
        const updatedComment = await (0, comment_service_1.updateComment)(id, content, req.user.id);
        return res.status(200).json(updatedComment);
    }
    catch (error) {
        if (error instanceof Error) {
            return res
                .status(400)
                .json({
                message: error instanceof Error ? error.message : "오류가 발생했습니다",
            });
        }
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.updateCommentController = updateCommentController;
const deleteCommentController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            throw (0, errorHandler_1.unauthorizedError)("로그인이 필요합니다.");
        }
        await (0, comment_service_1.deleteComment)(id, req.user.id);
        return res.status(200).json({ message: "댓글이 삭제되었습니다." });
    }
    catch (error) {
        if (error instanceof Error) {
            return res
                .status(400)
                .json({
                message: error instanceof Error ? error.message : "오류가 발생했습니다",
            });
        }
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
};
exports.deleteCommentController = deleteCommentController;
