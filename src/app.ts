import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import path from "path";
import apiRoutes from "./domains/index";
import { errorHandler, notFoundError } from "./middleware/errorHandler";
import { specs, swaggerUi } from "./swagger/swagger";

dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // 명시적으로 허용할 오리진 설정
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health check 엔드포인트
app.get("/", (req, res) => {
  res
    .status(200)
    .json({
      status: "ok",
      message: "Hello World! 서버가 정상적으로 실행 중입니다.",
    });
});

// 정적 파일 제공 설정 - 업로드된 이미지 접근을 위함
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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

const PORT = parseInt(process.env.PORT || "5005", 10);
const IP = process.env.HOST || "0.0.0.0"; // 모든 네트워크 인터페이스에서 연결 수락

app.listen(PORT, IP, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(
    `API 문서는 http://localhost:${PORT}/api-docs 에서 확인 가능합니다.`
  );
  console.log(
    `원격 접속 시 http://43.203.195.48:${PORT}/api-docs 에서 확인 가능합니다.`
  );
});
