"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
// Swagger 설정
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "판다마켓 API",
            version: "1.0.0",
            description: "판다마켓 관리를 위한 REST API",
        },
        servers: [
            {
                url: "http://localhost:5005",
                description: "개발 서버",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/swagger/*.ts"], // Swagger 주석이 있는 파일 경로 (* -> *.ts로 변경)
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.specs = specs;
