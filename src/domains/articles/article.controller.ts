import { Request, Response } from "express";
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "./article.service";
import handleError, {
  badRequestError,
  unauthorizedError,
} from "../../utils/errorHandler";
import { checkAuthenticated } from "../../utils/authHelpers";
import { ExpressHandler } from "../../types/express";

// Express 요청 타입 확장
interface ArticleRequest extends Request {
  user?: {
    id: string;
    email: string;
    nickname?: string;
  };
}

// 게시글 등록
const createArticleController: ExpressHandler = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = (req as ArticleRequest).user?.id;

    // 로그인 상태 확인
    checkAuthenticated(userId);

    const article = await createArticle(title, content, userId!);
    res.status(201).json(article);
  } catch (err) {
    handleError(err, res);
  }
};

// 게시글 목록 조회
const getArticlesController: ExpressHandler = async (req, res) => {
  try {
    const { page, limit, keyword, sortBy } = req.query;
    const userId = (req as ArticleRequest).user?.id; // 사용자 ID 가져오기 (로그인한 경우)

    // 쿼리 파라미터 타입 변환 및 기본값 처리
    const pageNum = page ? Number(page) : undefined;
    const limitNum = limit ? Number(limit) : undefined;

    const result = await getArticles(
      pageNum,
      limitNum,
      keyword as string | undefined,
      sortBy as string | undefined,
      userId
    );
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

// 게시글 상세 조회
const getArticleByIdController: ExpressHandler = async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = (req as ArticleRequest).user?.id; // 사용자 ID 가져오기 (로그인한 경우)
    const article = await getArticleById(id, userId);

    if (!article) {
      handleError(badRequestError("게시글을 찾을 수 없습니다."), res);
      return;
    }

    res.status(200).json(article);
  } catch (err) {
    handleError(err, res);
  }
};

// 게시글 수정
const updateArticleController: ExpressHandler = async (req, res) => {
  try {
    const id = String(req.params.id);
    const { title, content } = req.body;
    const userId = (req as ArticleRequest).user?.id;

    // 로그인 상태 확인
    checkAuthenticated(userId);

    const article = await updateArticle(id, title, content, userId);
    res.status(200).json(article);
  } catch (err) {
    handleError(err, res);
  }
};

// 게시글 삭제
const deleteArticleController: ExpressHandler = async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = (req as ArticleRequest).user?.id;

    // 로그인 상태 확인
    checkAuthenticated(userId);

    await deleteArticle(id, userId!);
    res.status(200).json({ message: "게시글이 성공적으로 삭제되었습니다." });
  } catch (err) {
    handleError(err, res);
  }
};

// 게시글 좋아요 추가
const addFavoriteController: ExpressHandler = async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = (req as ArticleRequest).user?.id;

    // 로그인 상태 확인
    checkAuthenticated(userId);

    // 이미 좋아요를 누른 경우 체크
    const alreadyFavorite = await checkFavorite(id, userId!);
    if (alreadyFavorite) {
      handleError(badRequestError("이미 좋아요를 누른 게시글입니다."), res);
      return;
    }

    const result = await addFavorite(id, userId!);
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

// 게시글 좋아요 취소
const removeFavoriteController: ExpressHandler = async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = (req as ArticleRequest).user?.id;

    // 로그인 상태 확인
    checkAuthenticated(userId);

    // 좋아요를 누르지 않은 경우 체크
    const hasFavorite = await checkFavorite(id, userId!);
    if (!hasFavorite) {
      handleError(badRequestError("좋아요를 누르지 않은 게시글입니다."), res);
      return;
    }

    const result = await removeFavorite(id, userId!);
    res.status(200).json(result);
  } catch (err) {
    handleError(err, res);
  }
};

// 게시글 좋아요 상태 확인
const checkFavoriteController: ExpressHandler = async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = (req as ArticleRequest).user?.id;

    // 로그인 상태 확인
    checkAuthenticated(userId);

    const isFavorite = await checkFavorite(id, userId!);
    res.status(200).json({ isFavorite });
  } catch (err) {
    handleError(err, res);
  }
};

export {
  createArticleController as createArticle,
  getArticleByIdController as getArticleById,
  updateArticleController as updateArticle,
  deleteArticleController as deleteArticle,
  getArticlesController as getArticles,
  addFavoriteController as addFavorite,
  removeFavoriteController as removeFavorite,
  checkFavoriteController as checkFavorite,
};
