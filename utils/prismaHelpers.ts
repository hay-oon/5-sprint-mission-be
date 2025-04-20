/**
 * Prisma 관련 유틸리티 함수들
 */
import { Prisma } from "@prisma/client";

// Prisma의 QueryMode 및 SortOrder 타입 정의
export type QueryMode = "default" | "insensitive";
export type SortOrder = "asc" | "desc";

/**
 * 키워드로 검색 조건을 생성하는 함수
 * @param keyword 검색 키워드
 * @param fields 검색할 필드 배열
 * @returns Prisma 검색 조건 객체
 */
export function createSearchCondition<T extends string>(
  keyword?: string,
  fields?: T[]
): any {
  if (!keyword || !fields || fields.length === 0) {
    return {};
  }

  const conditions = fields.map((field) => ({
    [field]: {
      contains: keyword,
      mode: "insensitive" as QueryMode,
    },
  }));

  return { OR: conditions };
}

/**
 * 정렬 조건을 생성하는 함수
 * @param sortBy 정렬 기준 필드
 * @param order 정렬 방향 ('asc' 또는 'desc')
 * @returns Prisma 정렬 조건 객체
 */
export function createOrderByCondition(
  sortBy: string,
  order: "asc" | "desc" = "desc"
): any {
  const orderBy: any = {};
  orderBy[sortBy] = order;
  return orderBy;
}

/**
 * 페이지네이션 계산 함수
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns skip과 take 값이 포함된 객체
 */
export function createPaginationParams(
  page: number = 1,
  pageSize: number = 10
): { skip: number; take: number } {
  const parsedPage = Number(page) || 1;
  const parsedPageSize = Number(pageSize) || 10;

  const skip = (parsedPage - 1) * parsedPageSize;
  return {
    skip,
    take: parsedPageSize,
  };
}
