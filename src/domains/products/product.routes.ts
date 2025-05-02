import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import upload from "../../middleware/multerConfig";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "./product.controller";

const router = express.Router();

// 상품 데이터 유효성 검사 미들웨어
const validateProductData = (req, res, next) => {
  if (req.method === "POST") {
    // 상품 생성 시 필수 필드 검증
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
      return res
        .status(400)
        .json({ message: "이름, 설명, 가격은 필수 입력 항목입니다." });
    }

    // 가격 유효성 검사
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: "유효한 가격을 입력해주세요." });
    }
  }

  if (req.method === "PATCH") {
    // 상품 수정 시 선택적 필드의 유효성 검증
    const { price } = req.body;
    if (price && (isNaN(price) || Number(price) <= 0)) {
      return res.status(400).json({ message: "유효한 가격을 입력해주세요." });
    }
  }

  next();
};

// 상품 라우트 설정
router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  (req, res, next) => validateProductData(req, res, next),
  (req, res) => createProduct(req, res)
);
router.get("/", (req, res) => getProducts(req, res));
router.get("/:id", (req, res) => getProductById(req, res));
router.patch(
  "/:id",
  authMiddleware,
  upload.array("images", 5),
  (req, res, next) => validateProductData(req, res, next),
  (req, res) => updateProduct(req, res)
);
router.delete("/:id", authMiddleware, (req, res) => deleteProduct(req, res));

// 좋아요 라우트 설정
router.post("/:id/favorite", authMiddleware, (req, res) =>
  addFavorite(req, res)
);
router.delete("/:id/favorite", authMiddleware, (req, res) =>
  removeFavorite(req, res)
);
router.get("/:id/favorite", authMiddleware, (req, res) =>
  checkFavorite(req, res)
);

export default router;
