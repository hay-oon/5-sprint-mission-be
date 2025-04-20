import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundError } from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import { specs, swaggerUi } from "./swagger.js";

// ES 모듈에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// 정적 파일 제공 설정 - 업로드된 이미지 접근을 위함
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger 설정
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Prisma 연결 테스트
prisma
  .$connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.use("/api", apiRoutes);

// 404 에러 처리 - 모든 라우트를 처리한 후에도 요청이 처리되지 않았을 때
app.use((req: Request, res: Response, next: NextFunction) => {
  next(notFoundError(`${req.originalUrl} 경로를 찾을 수 없습니다.`));
});

// 에러 처리 미들웨어 - 항상 라우트 처리 후 마지막에 위치
app.use(errorHandler);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(
    `API 문서는 http://localhost:${PORT}/api-docs 에서 확인 가능합니다.`
  );
});
