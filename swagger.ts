import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Swagger 설정
const options: swaggerJsdoc.Options = {
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
  apis: ["./swagger/*.ts"], // Swagger 주석이 있는 파일 경로 (*.js -> *.ts로 변경)
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
