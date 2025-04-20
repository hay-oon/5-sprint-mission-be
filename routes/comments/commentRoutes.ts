import express from "express";
import {
  createArticleCommentController,
  createProductCommentController,
  getArticleCommentsController,
  getProductCommentsController,
  updateCommentController,
  deleteCommentController,
} from "./commentController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
const router = express.Router();

// articles 관련 댓글 라우팅
router.post("/articles/:articleId/comments", authMiddleware, (req, res) =>
  createArticleCommentController(req, res)
);
router.get("/articles/:articleId/comments", (req, res) =>
  getArticleCommentsController(req, res)
);

// products 관련 댓글 라우팅
router.post("/products/:productId/comments", authMiddleware, (req, res) =>
  createProductCommentController(req, res)
);
router.get("/products/:productId/comments", (req, res) =>
  getProductCommentsController(req, res)
);

// 일반 댓글 작업 라우팅
router.patch("/comments/:id", authMiddleware, (req, res) =>
  updateCommentController(req, res)
);
router.delete("/comments/:id", authMiddleware, (req, res) =>
  deleteCommentController(req, res)
);

export default router;
