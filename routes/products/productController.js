import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 상품 등록
const createProduct = async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        tags,
      },
    });
    res.status(201).send(product);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

// 상품 목록 조회
// id name price createdAt
// 페이지네이션 적용
// 검색 기능 추가 - name, description

const getProducts = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;

    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });
    const total = await prisma.product.count({ where }); // [products, total] = await Promise.all 로 묶어서 비동기 처리가능

    res.status(200).send({
      products,
      total,
      totalPages: Math.ceil(total / Number(pageSize)),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 상품 상세 조회
// id name description price tags createdAt
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        createdAt: true,
      },
    });

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
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, tags } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price, tags },
    });

    res.status(200).send(product);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

// 상품 삭제
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).send({ message: "Product deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(500).send({ message: err.message });
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
