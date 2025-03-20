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

  console.log("데이터 삭제 완료");

  // user data seeding
  await prisma.user.createMany({
    data: mockUsers,
  });
  console.log("사용자 데이터 시딩 완료");

  // product data seeding - 사용자별로 다양하게 제품 생성
  const productData = mockProducts.slice(0, 20).map((product, index) => {
    // 사용자 ID를 번갈아가며 할당 (제품마다 다른 사용자가 생성)
    const userIndex = index % mockUsers.length;
    return {
      ...product,
      userId: mockUsers[userIndex].id,
    };
  });

  await prisma.product.createMany({
    data: productData,
  });
  console.log("제품 데이터 시딩 완료");

  // article data seeding - 사용자별로 다양하게 게시글 생성
  const articleData = mockArticles.slice(0, 20).map((article, index) => {
    // 사용자 ID를 번갈아가며 할당 (게시글마다 다른 사용자가 생성)
    const userIndex = (index + 3) % mockUsers.length; // 제품과 게시글 작성자가 다르도록 오프셋 추가
    return {
      ...article,
      userId: mockUsers[userIndex].id,
    };
  });

  await prisma.article.createMany({
    data: articleData,
  });
  console.log("게시글 데이터 시딩 완료");

  // comment data seeding - 각 게시물마다 4-8개의 댓글 랜덤하게 추가
  const products = await prisma.product.findMany();
  const articles = await prisma.article.findMany();
  const users = await prisma.user.findMany();

  // 댓글 데이터 생성 함수 - 다양한 사용자가 댓글 작성
  const createRandomComments = (targetId, isProduct = true) => {
    // 4-8개의 댓글을 랜덤하게 생성
    const commentCount = Math.floor(Math.random() * 5) + 4; // 4에서 8 사이의 랜덤 값
    const comments = [];

    for (let i = 0; i < commentCount; i++) {
      // 댓글 내용을 mockComments에서 랜덤하게 선택
      const randomCommentIndex = Math.floor(
        Math.random() * mockComments.length
      );
      // 댓글 작성자를 users에서 랜덤하게 선택
      const randomUserIndex = Math.floor(Math.random() * users.length);

      const comment = {
        content: mockComments[randomCommentIndex].content,
        userId: users[randomUserIndex].id,
      };

      // 제품이나 게시글 ID 추가
      if (isProduct) {
        comment.productId = targetId;
      } else {
        comment.articleId = targetId;
      }

      comments.push(comment);
    }

    return comments;
  };

  // 제품 댓글 생성
  let commentsToCreate = [];
  for (const product of products) {
    const productComments = createRandomComments(product.id, true);
    commentsToCreate = [...commentsToCreate, ...productComments];
  }

  // 게시글 댓글 생성
  for (const article of articles) {
    const articleComments = createRandomComments(article.id, false);
    commentsToCreate = [...commentsToCreate, ...articleComments];
  }

  // 모든 댓글 한번에 생성
  await prisma.comment.createMany({
    data: commentsToCreate,
  });
  console.log("댓글 데이터 시딩 완료");

  // favorite data seeding - 각 제품과 게시글에 좋아요 랜덤하게 추가
  const favorites = [];

  // 제품 좋아요 랜덤 생성 - 각 제품마다 여러 사용자의 좋아요 추가
  for (const product of products) {
    // 각 제품에 0-5명의 사용자가 좋아요를 누름
    const favoriteCount = Math.floor(Math.random() * 6);

    if (favoriteCount > 0) {
      // 좋아요를 누를 사용자들 선택 (중복 없이)
      const shuffledUsers = [...users]
        .sort(() => 0.5 - Math.random())
        .slice(0, favoriteCount);

      for (const user of shuffledUsers) {
        favorites.push({
          userId: user.id,
          productId: product.id,
        });
      }

      // favoriteCount 업데이트
      await prisma.product.update({
        where: { id: product.id },
        data: { favoriteCount: favoriteCount },
      });
    }
  }

  // 게시글 좋아요 랜덤 생성 - 각 게시글마다 여러 사용자의 좋아요 추가
  for (const article of articles) {
    // 각 게시글에 0-10명의 사용자가 좋아요를 누름
    const favoriteCount = Math.floor(Math.random() * 11);

    if (favoriteCount > 0) {
      // 좋아요를 누를 사용자들 선택 (중복 없이)
      const shuffledUsers = [...users]
        .sort(() => 0.5 - Math.random())
        .slice(0, favoriteCount);

      for (const user of shuffledUsers) {
        favorites.push({
          userId: user.id,
          articleId: article.id,
        });
      }

      // favoriteCount 업데이트
      await prisma.article.update({
        where: { id: article.id },
        data: { favoriteCount: favoriteCount },
      });
    }
  }

  // 좋아요 생성 - 트랜잭션으로 처리 (중복 오류 방지)
  for (const favorite of favorites) {
    try {
      await prisma.favorite.create({
        data: favorite,
      });
    } catch (error) {
      console.log("좋아요 생성 중 오류 발생 (중복 가능성):", error.message);
    }
  }

  console.log("좋아요 데이터 시딩 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
