"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFavorite = exports.removeFavorite = exports.addFavorite = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const product_service_1 = require("./product.service");
const errorHandler_1 = require("../../utils/errorHandler");
/**
 * 상품 생성 컨트롤러
 */
const createProduct = async (req, res) => {
    try {
        const { name, description, price, tags } = req.body;
        const images = req.files
            ? req.files.map((file) => file.path)
            : [];
        if (!req.user) {
            throw (0, errorHandler_1.unauthorizedError)("로그인이 필요합니다.");
        }
        console.log("Controller - Create product request:", {
            userId: req.user.id,
            user: req.user,
        });
        // JSON 문자열로 전달된 tags를 배열로 파싱
        const parsedTags = tags ? JSON.parse(tags) : [];
        const product = await (0, product_service_1.createProduct)(name, description, Number(price), parsedTags, images, String(req.user.id));
        res.status(201).json(product);
    }
    catch (error) {
        console.error("Create product error:", error);
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.createProduct = createProduct;
/**
 * 상품 목록 조회 컨트롤러
 */
const getProducts = async (req, res) => {
    try {
        const { page = 1, pageSize = 10, orderBy = "recent", keyword } = req.query;
        const userId = req.user ? String(req.user.id) : null;
        const products = await (0, product_service_1.getProducts)(Number(page), Number(pageSize), orderBy, keyword, userId);
        res.json(products);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.getProducts = getProducts;
/**
 * 상품 상세 조회 컨트롤러
 */
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ? String(req.user.id) : null;
        const product = await (0, product_service_1.getProductById)(id, userId);
        if (!product) {
            throw (0, errorHandler_1.notFoundError)("상품을 찾을 수 없습니다.");
        }
        res.json(product);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.getProductById = getProductById;
/**
 * 상품 수정 컨트롤러
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, tags } = req.body;
        const images = req.files
            ? req.files.map((file) => file.path)
            : [];
        if (!req.user) {
            throw (0, errorHandler_1.unauthorizedError)("로그인이 필요합니다.");
        }
        console.log("Controller - Update product request:", {
            productId: id,
            userId: req.user.id,
            user: req.user,
        });
        // JSON 문자열로 전달된 tags를 배열로 파싱
        const parsedTags = tags ? JSON.parse(tags) : [];
        const product = await (0, product_service_1.updateProduct)(id, name, description, Number(price), parsedTags, images, String(req.user.id));
        res.json(product);
    }
    catch (error) {
        console.error("Update product error:", error);
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.updateProduct = updateProduct;
/**
 * 상품 삭제 컨트롤러
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            throw (0, errorHandler_1.unauthorizedError)("로그인이 필요합니다.");
        }
        const product = await (0, product_service_1.deleteProduct)(id, String(req.user.id));
        res.json(product);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.deleteProduct = deleteProduct;
/**
 * 상품 좋아요 추가 컨트롤러
 */
const addFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            throw (0, errorHandler_1.unauthorizedError)("로그인이 필요합니다.");
        }
        const product = await (0, product_service_1.addFavorite)(id, String(req.user.id));
        res.json(product);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.addFavorite = addFavorite;
/**
 * 상품 좋아요 삭제 컨트롤러
 */
const removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            throw (0, errorHandler_1.unauthorizedError)("로그인이 필요합니다.");
        }
        const product = await (0, product_service_1.removeFavorite)(id, String(req.user.id));
        res.json(product);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.removeFavorite = removeFavorite;
/**
 * 상품 좋아요 확인 컨트롤러
 */
const checkFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            throw (0, errorHandler_1.unauthorizedError)("로그인이 필요합니다.");
        }
        const isFavorite = await (0, product_service_1.checkFavorite)(id, String(req.user.id));
        res.json({ isFavorite });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(error, res);
    }
};
exports.checkFavorite = checkFavorite;
