import express from "express";
import {
  createArticleComment,
  createProductComment,
  getArticleComments,
  getProductComments,
  updateComment,
  deleteComment,
} from "./commentController.js";

const router = express.Router();

// articles 관련 댓글 라우팅
router.post("/articles/:articleId/comments", createArticleComment);
router.get("/articles/:articleId/comments", getArticleComments);

// products 관련 댓글 라우팅
router.post("/products/:productId/comments", createProductComment);
router.get("/products/:productId/comments", getProductComments);

// 일반 댓글 작업 라우팅
router.patch("/comments/:id", updateComment);
router.delete("/comments/:id", deleteComment);

export default router;
