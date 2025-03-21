import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
} from "./productController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProduct);
router.get("/", getProducts);
router.get("/:id", authMiddleware, getProductById);
router.patch("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

// 좋아요 관련 라우트
router.post("/:id/favorite", authMiddleware, addFavorite);
router.delete("/:id/favorite", authMiddleware, removeFavorite);

export default router;
