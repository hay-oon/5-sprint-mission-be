// Prisma 모델 기반 타입 정의

// 제품 모델
export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  favoriteCount: number;
}

// 클라이언트 응답용 제품 모델
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  favoriteCount: number;
  ownerId: string;
  ownerNickname: string;
  isFavorite: boolean;
}

// 게시글 모델
export interface Article {
  id: string;
  userId: string;
  title: string;
  content: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  favoriteCount: number;
}

// 클라이언트 응답용 게시글 모델
export interface ArticleResponse extends Omit<Article, "userId"> {
  writer: {
    id: string;
    nickname: string;
  } | null;
  isFavorite: boolean;
}

// 댓글 모델
export interface Comment {
  id: string;
  userId: string;
  content: string;
  productId: string | null;
  articleId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 클라이언트 응답용 댓글 모델
export interface CommentResponse extends Omit<Comment, "userId"> {
  user: {
    id: string;
    nickname: string;
    image: string | null;
  };
}

// 사용자 모델
export interface User {
  id: string;
  email: string;
  nickname: string;
  encryptedPassword: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// JWT 토큰 페이로드
export interface JwtPayload {
  id: string | number;
  email: string;
  iat?: number;
  exp?: number;
}
