"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const product_controller_1 = require("./product.controller");
const router = express_1.default.Router();
// 업로드 디렉토리 설정
const uploadDir = (0, path_1.join)(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// 파일 저장 설정
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + (0, path_1.extname)(file.originalname));
    },
});
// 이미지 필터 설정
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname_ = allowedTypes.test((0, path_1.extname)(file.originalname).toLowerCase());
    if (mimetype && extname_) {
        return cb(null, true);
    }
    else {
        cb(new Error("지원되지 않는 파일 형식입니다! (jpg, jpeg, png, gif만 가능)"));
    }
};
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
// 파일 업로드 설정
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    fileFilter: fileFilter,
});
// 상품 라우트 설정
router.post("/", authMiddleware_1.authMiddleware, upload.array("images", 5), (req, res, next) => validateProductData(req, res, next), (req, res) => (0, product_controller_1.createProduct)(req, res));
router.get("/", (req, res) => (0, product_controller_1.getProducts)(req, res));
router.get("/:id", (req, res) => (0, product_controller_1.getProductById)(req, res));
router.patch("/:id", authMiddleware_1.authMiddleware, upload.array("images", 5), (req, res, next) => validateProductData(req, res, next), (req, res) => (0, product_controller_1.updateProduct)(req, res));
router.delete("/:id", authMiddleware_1.authMiddleware, (req, res) => (0, product_controller_1.deleteProduct)(req, res));
// 좋아요 라우트 설정
router.post("/:id/favorite", authMiddleware_1.authMiddleware, (req, res) => (0, product_controller_1.addFavorite)(req, res));
router.delete("/:id/favorite", authMiddleware_1.authMiddleware, (req, res) => (0, product_controller_1.removeFavorite)(req, res));
router.get("/:id/favorite", authMiddleware_1.authMiddleware, (req, res) => (0, product_controller_1.checkFavorite)(req, res));
exports.default = router;
