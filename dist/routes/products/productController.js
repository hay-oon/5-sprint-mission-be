import { createProduct as createProductService, getProducts as getProductsService, getProductById as getProductByIdService, updateProduct as updateProductService, deleteProduct as deleteProductService, addFavorite as addFavoriteService, removeFavorite as removeFavoriteService, checkFavorite as checkFavoriteService, } from "./productService.js";
import { handleError, notFoundError, unauthorizedError, } from "../../utils/errorHandler.js";
/**
 * 상품 생성 컨트롤러
 */
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, tags } = req.body;
        const images = req.files
            ? req.files.map((file) => file.path)
            : [];
        if (!req.user) {
            throw unauthorizedError("로그인이 필요합니다.");
        }
        // JSON 문자열로 전달된 tags를 배열로 파싱
        const parsedTags = tags ? JSON.parse(tags) : [];
        const product = await createProductService(name, description, Number(price), parsedTags, images, String(req.user.id));
        res.status(201).json(product);
    }
    catch (error) {
        handleError(error, res);
    }
};
/**
 * 상품 목록 조회 컨트롤러
 */
export const getProducts = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, orderBy = "recent", keyword } = req.query;
        const userId = req.user ? String(req.user.id) : null;
        const products = await getProductsService(Number(page), Number(pageSize), orderBy, keyword, userId);
        res.json(products);
    }
    catch (error) {
        handleError(error, res);
    }
};
/**
 * 상품 상세 조회 컨트롤러
 */
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? String(req.user.id) : null;
        const product = await getProductByIdService(id, userId);
        if (!product) {
            throw notFoundError("상품을 찾을 수 없습니다.");
        }
        res.json(product);
    }
    catch (error) {
        handleError(error, res);
    }
};
/**
 * 상품 수정 컨트롤러
 */
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, tags } = req.body;
        const images = req.files
            ? req.files.map((file) => file.path)
            : [];
        if (!req.user) {
            throw unauthorizedError("로그인이 필요합니다.");
        }
        // JSON 문자열로 전달된 tags를 배열로 파싱
        const parsedTags = tags ? JSON.parse(tags) : [];
        const product = await updateProductService(id, name, description, Number(price), parsedTags, images, String(req.user.id));
        res.json(product);
    }
    catch (error) {
        handleError(error, res);
    }
};
/**
 * 상품 삭제 컨트롤러
 */
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            throw unauthorizedError("로그인이 필요합니다.");
        }
        const product = await deleteProductService(id, String(req.user.id));
        res.json(product);
    }
    catch (error) {
        handleError(error, res);
    }
};
/**
 * 상품 좋아요 추가 컨트롤러
 */
export const addFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            throw unauthorizedError("로그인이 필요합니다.");
        }
        const product = await addFavoriteService(id, String(req.user.id));
        res.json(product);
    }
    catch (error) {
        handleError(error, res);
    }
};
/**
 * 상품 좋아요 삭제 컨트롤러
 */
export const removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            throw unauthorizedError("로그인이 필요합니다.");
        }
        const product = await removeFavoriteService(id, String(req.user.id));
        res.json(product);
    }
    catch (error) {
        handleError(error, res);
    }
};
/**
 * 상품 좋아요 확인 컨트롤러
 */
export const checkFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            throw unauthorizedError("로그인이 필요합니다.");
        }
        const isFavorite = await checkFavoriteService(id, String(req.user.id));
        res.json({ isFavorite });
    }
    catch (error) {
        handleError(error, res);
    }
};
