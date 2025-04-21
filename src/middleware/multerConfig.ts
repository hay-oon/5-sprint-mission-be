import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// 업로드 디렉토리 설정
const uploadDir = "uploads/";

// 디렉토리가 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 설정
const upload = multer({
  storage: multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => {
      cb(null, uploadDir);
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) => {
      const uniqueName = Date.now() + path.extname(file.originalname);
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
});

export default upload;
