"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFavorite = exports.removeFavorite = exports.addFavorite = exports.getArticles = exports.deleteArticle = exports.updateArticle = exports.getArticleById = exports.createArticle = void 0;
const article_service_1 = require("./article.service");
const errorHandler_1 = __importStar(require("../../utils/errorHandler"));
const authHelpers_1 = require("../../utils/authHelpers");
// 게시글 등록
const createArticleController = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user?.id;
        // 로그인 상태 확인
        (0, authHelpers_1.checkAuthenticated)(userId);
        const article = await (0, article_service_1.createArticle)(title, content, userId);
        res.status(201).json(article);
    }
    catch (err) {
        (0, errorHandler_1.default)(err, res);
    }
};
exports.createArticle = createArticleController;
// 게시글 목록 조회
const getArticlesController = async (req, res) => {
    try {
        const { page, limit, keyword, sortBy } = req.query;
        const userId = req.user?.id; // 사용자 ID 가져오기 (로그인한 경우)
        // 쿼리 파라미터 타입 변환 및 기본값 처리
        const pageNum = page ? Number(page) : undefined;
        const limitNum = limit ? Number(limit) : undefined;
        const result = await (0, article_service_1.getArticles)(pageNum, limitNum, keyword, sortBy, userId);
        res.status(200).json(result);
    }
    catch (err) {
        (0, errorHandler_1.default)(err, res);
    }
};
exports.getArticles = getArticlesController;
// 게시글 상세 조회
const getArticleByIdController = async (req, res) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.id; // 사용자 ID 가져오기 (로그인한 경우)
        const article = await (0, article_service_1.getArticleById)(id, userId);
        if (!article) {
            (0, errorHandler_1.default)((0, errorHandler_1.badRequestError)("게시글을 찾을 수 없습니다."), res);
            return;
        }
        res.status(200).json(article);
    }
    catch (err) {
        (0, errorHandler_1.default)(err, res);
    }
};
exports.getArticleById = getArticleByIdController;
// 게시글 수정
const updateArticleController = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { title, content } = req.body;
        const userId = req.user?.id;
        // 로그인 상태 확인
        (0, authHelpers_1.checkAuthenticated)(userId);
        const article = await (0, article_service_1.updateArticle)(id, title, content, userId);
        res.status(200).json(article);
    }
    catch (err) {
        (0, errorHandler_1.default)(err, res);
    }
};
exports.updateArticle = updateArticleController;
// 게시글 삭제
const deleteArticleController = async (req, res) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.id;
        // 로그인 상태 확인
        (0, authHelpers_1.checkAuthenticated)(userId);
        await (0, article_service_1.deleteArticle)(id, userId);
        res.status(200).json({ message: "게시글이 성공적으로 삭제되었습니다." });
    }
    catch (err) {
        (0, errorHandler_1.default)(err, res);
    }
};
exports.deleteArticle = deleteArticleController;
// 게시글 좋아요 추가
const addFavoriteController = async (req, res) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.id;
        // 로그인 상태 확인
        (0, authHelpers_1.checkAuthenticated)(userId);
        // 이미 좋아요를 누른 경우 체크
        const alreadyFavorite = await (0, article_service_1.checkFavorite)(id, userId);
        if (alreadyFavorite) {
            (0, errorHandler_1.default)((0, errorHandler_1.badRequestError)("이미 좋아요를 누른 게시글입니다."), res);
            return;
        }
        const result = await (0, article_service_1.addFavorite)(id, userId);
        res.status(200).json(result);
    }
    catch (err) {
        (0, errorHandler_1.default)(err, res);
    }
};
exports.addFavorite = addFavoriteController;
// 게시글 좋아요 취소
const removeFavoriteController = async (req, res) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.id;
        // 로그인 상태 확인
        (0, authHelpers_1.checkAuthenticated)(userId);
        // 좋아요를 누르지 않은 경우 체크
        const hasFavorite = await (0, article_service_1.checkFavorite)(id, userId);
        if (!hasFavorite) {
            (0, errorHandler_1.default)((0, errorHandler_1.badRequestError)("좋아요를 누르지 않은 게시글입니다."), res);
            return;
        }
        const result = await (0, article_service_1.removeFavorite)(id, userId);
        res.status(200).json(result);
    }
    catch (err) {
        (0, errorHandler_1.default)(err, res);
    }
};
exports.removeFavorite = removeFavoriteController;
// 게시글 좋아요 상태 확인
const checkFavoriteController = async (req, res) => {
    try {
        const id = String(req.params.id);
        const userId = req.user?.id;
        // 로그인 상태 확인
        (0, authHelpers_1.checkAuthenticated)(userId);
        const isFavorite = await (0, article_service_1.checkFavorite)(id, userId);
        res.status(200).json({ isFavorite });
    }
    catch (err) {
        (0, errorHandler_1.default)(err, res);
    }
};
exports.checkFavorite = checkFavoriteController;
