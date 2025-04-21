"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./domains/index"));
const errorHandler_1 = require("./middleware/errorHandler");
const swagger_1 = require("./swagger/swagger");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// 정적 파일 제공 설정 - 업로드된 이미지 접근을 위함
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// Swagger 설정
app.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs));
// Prisma 연결 테스트
prisma
    .$connect()
    .then(() => {
    console.log("Connected to PostgreSQL database");
})
    .catch((err) => {
    console.error("Unable to connect to the database:", err);
});
app.use("/api", index_1.default);
// 404 에러 처리 - 모든 라우트를 처리한 후에도 요청이 처리되지 않았을 때
app.use((req, res, next) => {
    next((0, errorHandler_1.notFoundError)(`${req.originalUrl} 경로를 찾을 수 없습니다.`));
});
// 에러 처리 미들웨어 - 항상 라우트 처리 후 마지막에 위치
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`API 문서는 http://localhost:${PORT}/api-docs 에서 확인 가능합니다.`);
});
