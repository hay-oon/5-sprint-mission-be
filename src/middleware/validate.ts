import { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";

type ZodSchema = z.ZodType<any, any, any>;

/**
 * Zod 스키마를 사용하여 요청 데이터의 유효성을 검사하는 미들웨어
 * @param schema 유효성 검사에 사용할 Zod 스키마
 * @param source 검사할 요청 데이터 소스 (기본값: body)
 */
export const validate = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 요청 데이터를 스키마로 검증 (동기적으로 처리)
      const data = schema.parse(req[source]);

      // 검증된 데이터를 원래 요청 객체에 할당
      req[source] = data;

      next();
    } catch (error) {
      // Zod 오류 처리
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: "입력 데이터가 유효하지 않습니다",
          errors: formattedErrors,
        });
      } else {
        // 기타 오류 처리
        res.status(500).json({
          success: false,
          message: "서버 오류가 발생했습니다",
        });
      }
    }
  };
};
