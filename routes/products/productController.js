import Product from "../../models/Product.js";

// 상품 등록
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    const product = new Product({ name, description, price, tags });
    const savedProduct = await product.save();
    res.status(201).send(savedProduct);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

// 상품 목록 조회
// id name price createdAt
// 페이지네이션 적용
// 검색 기능 추가 - name, description

export const getProducts = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;

    const query = {};
    if (keyword) {
      // 정규식 검색 조건
      query.$or = [
        { name: { $regex: keyword, $options: "i" } }, // regex: 정규식 검색, options: 대소문자 구분 없음
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .select("id name description price createdAt") // description 필드 추가
      .sort({ createdAt: -1 }) // 내림차순 (최신순) 정렬, "desc"와 같음
      .skip((page - 1) * pageSize) // 페이지네이션
      .limit(Number(pageSize)); // 페이지네이션

    const total = await Product.countDocuments(query);

    res.status(200).send({
      products,
      totalPages: Math.ceil(total / pageSize),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 상품 상세 조회
// id name description price tags createdAt
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select(
      "id name description price tags createdAt" // 조회할 필드 선택
    );
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
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true, // 업데이트된 데이터 반환 by mongoose
      runValidators: true, // 유효성 검사 실행 by mongoose
    });
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).send(product);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 상품 삭제
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).send({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
