/**
 * 데이터 포맷팅을 위한 유틸리티 함수들
 */

/**
 * 사용자 정보 포맷팅 함수
 * @param user 사용자 객체
 * @returns 포맷팅된 사용자 정보
 */
export function formatUserInfo(user: any | null) {
  if (!user) return null;

  return {
    id: user.id,
    nickname: user.nickname || null,
  };
}

/**
 * 게시글 응답 DTO 생성 함수
 * @param article 게시글 데이터
 * @param writer 작성자 정보
 * @param isFavorite 좋아요 상태
 * @returns 클라이언트에 반환할 응답 DTO
 */
export function createArticleResponseDto(
  article: any,
  writer: any | null,
  isFavorite: boolean = false
) {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    favoriteCount: article.favoriteCount,
    image: null, // 이미지 필드
    writer: writer
      ? {
          id: writer.id,
          nickname: writer.nickname,
        }
      : null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    isFavorite,
  };
}

/**
 * 상품 응답 DTO 생성 함수
 * @param product 상품 데이터
 * @param owner 소유자 정보
 * @param isFavorite 좋아요 상태
 * @returns 클라이언트에 반환할 응답 DTO
 */
export function createProductResponseDto(
  product: any,
  owner: any | null,
  isFavorite: boolean = false
) {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    images: product.images?.map((img: any) => img.url) || [],
    status: product.status,
    categoryId: product.categoryId,
    favoriteCount: product.favoriteCount,
    ownerId: product.ownerId,
    ownerNickname: owner?.nickname || null,
    createdAt: product.createdAt,
    isFavorite,
  };
}

/**
 * 좋아요 상태를 첨부하는 함수
 * @param items 아이템 배열
 * @param favoriteItemIds 좋아요한 아이템 ID 배열
 * @returns 좋아요 상태가 포함된 아이템 배열
 */
export function attachFavoriteStatus<T extends { id: string }>(
  items: T[],
  favoriteItemIds: Set<string | null> | Set<string>
): (T & { isFavorite: boolean })[] {
  return items.map((item) => ({
    ...item,
    isFavorite: favoriteItemIds.has(item.id),
  }));
}

/**
 * 데이터 목록 응답 포맷 생성 함수
 * @param items 아이템 배열
 * @param totalCount 전체 아이템 수
 * @returns 표준화된 목록 응답 객체
 */
export function createListResponse<T>(items: T[], totalCount: number) {
  return {
    items,
    totalCount,
    hasMore: false, // 기본값
  };
}
