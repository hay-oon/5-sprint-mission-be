/**
 * 상품 등록 및 수정을 위한 유효성 검사 미들웨어
 */
import { Request, Response, NextFunction } from "express";

interface ProductData {
  name?: string;
  description?: string;
  price?: number | string;
  tags?: string[] | string;
}

// 상품명, 설명, 가격에 대한 유효성 검사
export const validateProductData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description, price, tags } = req.body as ProductData;
  const errors: string[] = [];

  // 상품명 검사: 필수 입력, 최대 10자
  if (!name || name.trim() === "") {
    errors.push("상품명은 필수 입력 항목입니다.");
  } else if (name.length > 10) {
    errors.push("상품명은 최대 10자까지 입력 가능합니다.");
  }

  // 상품 설명 검사: 필수 입력, 최소 10자 이상
  if (!description || description.trim() === "") {
    errors.push("상품 설명은 필수 입력 항목입니다.");
  } else if (description.trim().length < 10) {
    errors.push("상품 설명은 최소 10자 이상 입력해야 합니다.");
  }

  // 가격 검사: 필수 입력, 양수
  if (price === undefined || price === null) {
    errors.push("가격은 필수 입력 항목입니다.");
  } else {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      errors.push("가격은 0보다 큰 숫자로 입력해야 합니다.");
    }
  }

  // 태그 검사: 각 태그 최대 5자, 중복 불가
  if (tags && Array.isArray(tags)) {
    const uniqueTags = new Set<string>();

    for (const tag of tags) {
      if (typeof tag !== "string") {
        errors.push("모든 태그는 문자열이어야 합니다.");
        break;
      }

      if (tag.length > 5) {
        errors.push(
          `태그는 5자 이내로 입력해야 합니다. 문제가 있는 태그: ${tag}`
        );
      }

      if (uniqueTags.has(tag)) {
        errors.push(`중복된 태그가 있습니다: ${tag}`);
      } else {
        uniqueTags.add(tag);
      }
    }
  }

  // 이미지 파일 검사
  if (req.files && Array.isArray(req.files) && req.files.length > 3) {
    errors.push("이미지는 최대 3개까지만 등록 가능합니다.");
  }

  // 오류가 있는 경우 에러 응답 반환
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "상품 데이터 유효성 검사 실패",
      errors,
    });
  }

  // 유효성 검사 통과
  next();
};

// JSON 형식이 아닌 폼 데이터로 요청이 올 경우를 위한 데이터 정제 미들웨어
export const sanitizeProductData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // price가 문자열로 넘어온 경우 숫자로 변환
  if (req.body.price && typeof req.body.price === "string") {
    // 콤마 제거 후 숫자로 변환
    req.body.price = Number(req.body.price.replace(/,/g, ""));
  }

  // tags가 문자열로 넘어온 경우 (JSON 문자열) 배열로 변환
  if (req.body.tags && typeof req.body.tags === "string") {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (error) {
      // JSON 파싱 실패 시 문자열을 쉼표로 분리하여 배열로 변환 시도
      req.body.tags = req.body.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag);
    }
  }

  next();
};
