import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./productService.js";

// 상품 등록
const createProductController = async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    const product = await createProduct(name, description, price, tags);
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
    const { page, pageSize, keyword } = req.query;
    const result = await getProducts(page, pageSize, keyword);
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
    const product = await getProductById(id);

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
    const product = await updateProduct(id, name, description, price, tags);
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
    await deleteProduct(id);
    res.status(200).send({ message: "Product deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

export {
  createProductController as createProduct,
  getProductsController as getProducts,
  getProductByIdController as getProductById,
  updateProductController as updateProduct,
  deleteProductController as deleteProduct,
};
