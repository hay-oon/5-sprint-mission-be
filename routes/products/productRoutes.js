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
import upload from "../../middleware/multerConfig.js";

const router = express.Router();

// 이미지 업로드를 위해 multer 미들웨어 추가 (최대 5개 이미지 업로드 허용)
router.post("/", authMiddleware, upload.array("images", 5), createProduct);
router.get("/", getProducts);
router.get("/:id", authMiddleware, getProductById);
router.patch("/:id", authMiddleware, upload.array("images", 5), updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

// 좋아요 관련 라우트
router.post("/:id/favorite", authMiddleware, addFavorite);
router.delete("/:id/favorite", authMiddleware, removeFavorite);

export default router;
