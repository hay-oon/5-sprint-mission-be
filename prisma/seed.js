import { PrismaClient } from "@prisma/client";
import { mockProducts, mockArticles, mockComments } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.product.deleteMany();

  console.log("delete data");

  // product data seeding
  await prisma.product.createMany({
    data: mockProducts,
  });
  console.log("product data seeding");

  // article data seeding
  await prisma.article.createMany({
    data: mockArticles,
  });
  console.log("article data seeding");

  // comment data seeding
  const products = await prisma.product.findMany();
  const articles = await prisma.article.findMany();

  await prisma.comment.createMany({
    data: [
      ...products.map((product) => ({
        ...mockComments[0],
        productId: product.id,
      })),
      ...articles.map((article) => ({
        ...mockComments[1],
        articleId: article.id,
      })),
    ],
  });
  console.log("comment data seeding");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
