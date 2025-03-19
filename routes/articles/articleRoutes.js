import express from "express";
import {
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticles,
  addFavorite,
  removeFavorite,
} from "./articleController.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createArticle);
router.get("/", optionalAuthMiddleware, getArticles);
router.get("/:id", optionalAuthMiddleware, getArticleById);
router.patch("/:id", authMiddleware, updateArticle);
router.delete("/:id", authMiddleware, deleteArticle);

// 좋아요 관련 라우트
router.post("/:id/favorite", authMiddleware, addFavorite);
router.delete("/:id/favorite", authMiddleware, removeFavorite);

export default router;
