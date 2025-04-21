"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const article_controller_1 = require("./article.controller");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
// 게시글 기본 CRUD 라우트
router.post("/", authMiddleware_1.authMiddleware, article_controller_1.createArticle);
router.get("/", article_controller_1.getArticles);
router.get("/:id", article_controller_1.getArticleById);
router.patch("/:id", authMiddleware_1.authMiddleware, article_controller_1.updateArticle);
router.delete("/:id", authMiddleware_1.authMiddleware, article_controller_1.deleteArticle);
// 좋아요 관련 라우트
router.post("/:id/favorite", authMiddleware_1.authMiddleware, article_controller_1.addFavorite);
router.delete("/:id/favorite", authMiddleware_1.authMiddleware, article_controller_1.removeFavorite);
exports.default = router;
