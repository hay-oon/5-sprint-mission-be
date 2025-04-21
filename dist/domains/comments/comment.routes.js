"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("./comment.controller");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
// articles 관련 댓글 라우팅
router.post("/articles/:articleId/comments", authMiddleware_1.authMiddleware, (req, res) => (0, comment_controller_1.createArticleCommentController)(req, res));
router.get("/articles/:articleId/comments", (req, res) => (0, comment_controller_1.getArticleCommentsController)(req, res));
// products 관련 댓글 라우팅
router.post("/products/:productId/comments", authMiddleware_1.authMiddleware, (req, res) => (0, comment_controller_1.createProductCommentController)(req, res));
router.get("/products/:productId/comments", (req, res) => (0, comment_controller_1.getProductCommentsController)(req, res));
// 일반 댓글 작업 라우팅
router.patch("/comments/:id", authMiddleware_1.authMiddleware, (req, res) => (0, comment_controller_1.updateCommentController)(req, res));
router.delete("/comments/:id", authMiddleware_1.authMiddleware, (req, res) => (0, comment_controller_1.deleteCommentController)(req, res));
exports.default = router;
