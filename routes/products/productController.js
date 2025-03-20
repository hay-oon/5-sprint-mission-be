import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "./productService.js";

// 상품 등록
const createProductController = async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).send({ message: "로그인이 필요합니다." });
    }

    const product = await createProduct(name, description, price, tags, userId);
    res.status(201).send(product);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

// 상품 목록 조회
// id name price createdAt
// 페이지네이션 적용
// 검색 기능 추가 - name, description

const getProductsController = async (req, res) => {
  try {
    const { page, pageSize, orderBy, keyword } = req.query;
    const userId = req.user?.id;
    const result = await getProducts(page, pageSize, orderBy, keyword, userId);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 상품 상세 조회
// id name description price tags createdAt
const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const product = await getProductById(id, userId);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 상품 수정
// patch 메서드 사용
// id name description price tags
const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, tags } = req.body;
    const userId = req.user?.id;
    const product = await updateProduct(
      id,
      name,
      description,
      price,
      tags,
      userId
    );
    res.status(200).send(product);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

// 상품 삭제
const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    await deleteProduct(id, userId);
    res.status(200).send({ message: "Product deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

// 제품 좋아요 추가
const addFavoriteController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // 인증 미들웨어를 통해 사용자 ID 가져오기

    if (!userId) {
      return res.status(401).send({ message: "로그인이 필요합니다." });
    }

    // 이미 좋아요를 누른 경우 체크
    const alreadyFavorite = await checkFavorite(id, userId);
    if (alreadyFavorite) {
      return res
        .status(400)
        .send({ message: "이미 좋아요를 누른 제품입니다." });
    }

    const result = await addFavorite(id, userId);
    res.status(200).send(result);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "제품을 찾을 수 없습니다." });
    }
    res.status(500).send({ message: err.message });
  }
};

// 제품 좋아요 취소
const removeFavoriteController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // 인증 미들웨어를 통해 사용자 ID 가져오기

    if (!userId) {
      return res.status(401).send({ message: "로그인이 필요합니다." });
    }

    // 좋아요를 누르지 않은 경우 체크
    const hasFavorite = await checkFavorite(id, userId);
    if (!hasFavorite) {
      return res
        .status(400)
        .send({ message: "좋아요를 누르지 않은 제품입니다." });
    }

    const result = await removeFavorite(id, userId);
    res.status(200).send(result);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "제품을 찾을 수 없습니다." });
    }
    res.status(500).send({ message: err.message });
  }
};

// 제품 좋아요 상태 확인
const checkFavoriteController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // 인증 미들웨어를 통해 사용자 ID 가져오기

    if (!userId) {
      return res.status(401).send({ message: "로그인이 필요합니다." });
    }

    const isFavorite = await checkFavorite(id, userId);
    res.status(200).send({ isFavorite });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export {
  createProductController as createProduct,
  getProductsController as getProducts,
  getProductByIdController as getProductById,
  updateProductController as updateProduct,
  deleteProductController as deleteProduct,
  addFavoriteController as addFavorite,
  removeFavoriteController as removeFavorite,
  checkFavoriteController as checkFavorite,
};
