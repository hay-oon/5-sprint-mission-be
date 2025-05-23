import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundError } from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import { specs, swaggerUi } from "./swagger.js";

// __dirname 설정 (ES 모듈에서는 __dirname이 기본적으로 제공되지 않음)
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
app.use((req, res, next) => {
  next(notFoundError(`${req.originalUrl} 경로를 찾을 수 없습니다.`));
});

// 에러 처리 미들웨어 - 항상 라우트 처리 후 마지막에 위치
app.use(errorHandler);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});
