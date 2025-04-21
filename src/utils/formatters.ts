/**
 * article 생성 DTO
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
          nickname: writer.nickname || null,
        }
      : null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    isFavorite,
  };
}

/**
 * product 생성 DTO
 */
export function createProductResponseDto(
  product: any,
  owner: { id: string; nickname: string } | null,
  isFavorite: boolean = false
) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    tags: product.tags || [],
    images: product.images || [],
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    favoriteCount: product.favoriteCount || 0,
    ownerId: owner?.id || product.userId || "unknown",
    ownerNickname: owner?.nickname || "Unknown User",
    isFavorite,
  };
}

/**
 * 좋아요 상태를 첨부하는 함수
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
