import { PrismaClient } from "@prisma/client";
import { mockProducts, mockArticles, mockComments, mockUsers } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제
  await prisma.favorite.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log("delete data");

  // user data seeding
  await prisma.user.createMany({
    data: mockUsers,
  });
  console.log("user data seeding");

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

  // favorite data seeding - 각 제품과 게시글에 좋아요 일부 추가
  const userId = mockUsers[0].id;

  // 제품 일부에 좋아요 추가
  for (let i = 0; i < 10; i++) {
    if (products[i]) {
      await prisma.favorite.create({
        data: {
          userId,
          productId: products[i].id,
        },
      });

      // favoriteCount 업데이트
      await prisma.product.update({
        where: { id: products[i].id },
        data: { favoriteCount: 1 },
      });
    }
  }

  // 게시글 일부에 좋아요 추가
  for (let i = 0; i < 10; i++) {
    if (articles[i]) {
      await prisma.favorite.create({
        data: {
          userId,
          articleId: articles[i].id,
        },
      });

      // favoriteCount 업데이트
      await prisma.article.update({
        where: { id: articles[i].id },
        data: { favoriteCount: { increment: 1 } },
      });
    }
  }

  console.log("favorite data seeding");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
