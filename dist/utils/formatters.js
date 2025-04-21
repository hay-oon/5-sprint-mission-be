"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createArticleResponseDto = createArticleResponseDto;
exports.createProductResponseDto = createProductResponseDto;
exports.attachFavoriteStatus = attachFavoriteStatus;
/**
 * article 생성 DTO
 */
function createArticleResponseDto(article, writer, isFavorite = false) {
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
function createProductResponseDto(product, owner, isFavorite = false) {
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
function attachFavoriteStatus(items, favoriteItemIds) {
    return items.map((item) => ({
        ...item,
        isFavorite: favoriteItemIds.has(item.id),
    }));
}
