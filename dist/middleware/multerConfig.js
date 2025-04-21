"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// 업로드 디렉토리 설정
const uploadDir = "uploads/";
// 디렉토리가 없으면 생성
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// multer 설정
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + path_1.default.extname(file.originalname);
            cb(null, uniqueName);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 제한
    },
});
exports.default = upload;
