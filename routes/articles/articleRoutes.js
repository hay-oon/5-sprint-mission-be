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
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createArticle);
router.get("/", getArticles);
router.get("/:id", authMiddleware, getArticleById);
router.patch("/:id", authMiddleware, updateArticle);
router.delete("/:id", authMiddleware, deleteArticle);

// 좋아요 관련 라우트
router.post("/:id/favorite", authMiddleware, addFavorite);
router.delete("/:id/favorite", authMiddleware, removeFavorite);

export default router;
