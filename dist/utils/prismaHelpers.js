/**
 * 키워드로 검색 조건을 생성하는 함수
 * @param keyword 검색 키워드
 * @param fields 검색할 필드 배열
 * @returns Prisma 검색 조건 객체
 */
export function createSearchCondition(keyword, fields) {
    if (!keyword || !fields || fields.length === 0) {
        return {};
    }
    const conditions = fields.map((field) => ({
        [field]: {
            contains: keyword,
            mode: "insensitive",
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
export function createOrderByCondition(sortBy, order = "desc") {
    const orderBy = {};
    orderBy[sortBy] = order;
    return orderBy;
}
/**
 * 페이지네이션 계산 함수
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns skip과 take 값이 포함된 객체
 */
export function createPaginationParams(page = 1, pageSize = 10) {
    const parsedPage = Number(page) || 1;
    const parsedPageSize = Number(pageSize) || 10;
    const skip = (parsedPage - 1) * parsedPageSize;
    return {
        skip,
        take: parsedPageSize,
    };
}
