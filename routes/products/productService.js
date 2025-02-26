import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createProduct = async (name, description, price, tags) => {
  return await prisma.product.create({
    data: {
      name,
      description,
      price,
      tags,
    },
  });
};

const getProducts = async (page = 1, pageSize = 10, keyword) => {
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

  const total = await prisma.product.count({ where });

  return {
    products,
    total,
    totalPages: Math.ceil(total / Number(pageSize)),
    currentPage: Number(page),
  };
};

const getProductById = async (id) => {
  return await prisma.product.findUnique({
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
};

const updateProduct = async (id, name, description, price, tags) => {
  return await prisma.product.update({
    where: { id },
    data: { name, description, price, tags },
  });
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id },
  });
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
