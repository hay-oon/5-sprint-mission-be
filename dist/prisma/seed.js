import { PrismaClient } from "@prisma/client";
import { mockProducts, mockArticles, mockUsers, mockRandomContent, } from "./mock.js";
const prisma = new PrismaClient();
/**
 * 테스트 데이터 생성
 */
async function seed() {
    try {
        console.log("테스트 데이터 생성 시작...");
        // 기존 데이터 초기화
        console.log("기존 데이터 삭제 중...");
        await prisma.favorite.deleteMany();
        await prisma.comment.deleteMany();
        await prisma.product.deleteMany();
        await prisma.article.deleteMany();
        await prisma.user.deleteMany();
        // 사용자 생성
        console.log("사용자 데이터 생성 중...");
        const users = await Promise.all(mockUsers.map((user) => prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                encryptedPassword: user.encryptedPassword,
                image: user.image,
            },
        })));
        // 제품 생성
        console.log("제품 데이터 생성 중...");
        const products = await Promise.all(mockProducts.map((product, index) => prisma.product.create({
            data: {
                name: product.name,
                description: product.description,
                price: product.price,
                tags: product.tags,
                images: product.images,
                userId: users[index % users.length].id,
            },
        })));
        // 게시글 생성
        console.log("게시글 데이터 생성 중...");
        const articles = await Promise.all(mockArticles.map((article, index) => prisma.article.create({
            data: {
                title: article.title,
                content: article.content,
                userId: users[index % users.length].id,
            },
        })));
        // 댓글 생성
        console.log("댓글 데이터 생성 중...");
        const comments = [];
        // 제품 댓글 생성
        products.forEach((product) => {
            const commentCount = Math.floor(Math.random() * 5) + 1; // 1~5개 댓글
            for (let i = 0; i < commentCount; i++) {
                const comment = {
                    content: mockRandomContent(),
                    userId: users[Math.floor(Math.random() * users.length)].id,
                };
                comment.productId = product.id;
                comments.push(comment);
            }
        });
        // 게시글 댓글 생성
        articles.forEach((article) => {
            const commentCount = Math.floor(Math.random() * 5) + 1; // 1~5개 댓글
            for (let i = 0; i < commentCount; i++) {
                const comment = {
                    content: mockRandomContent(),
                    userId: users[Math.floor(Math.random() * users.length)].id,
                };
                comment.articleId = article.id;
                comments.push(comment);
            }
        });
        // 댓글 저장
        await Promise.all(comments.map((comment) => prisma.comment.create({
            data: comment,
        })));
        // 좋아요 생성
        console.log("좋아요 데이터 생성 중...");
        const favorites = [];
        // 제품 좋아요 생성 (일부 사용자가 일부 제품에 좋아요)
        products.forEach((product) => {
            // 약 30%의 사용자가 좋아요
            const likeCount = Math.floor(users.length * 0.3);
            const randomUsers = [...users]
                .sort(() => 0.5 - Math.random())
                .slice(0, likeCount);
            randomUsers.forEach((user) => {
                favorites.push({
                    userId: user.id,
                    productId: product.id,
                });
            });
        });
        // 게시글 좋아요 생성 (일부 사용자가 일부 게시글에 좋아요)
        articles.forEach((article) => {
            // 약 20%의 사용자가 좋아요
            const likeCount = Math.floor(users.length * 0.2);
            const randomUsers = [...users]
                .sort(() => 0.5 - Math.random())
                .slice(0, likeCount);
            randomUsers.forEach((user) => {
                favorites.push({
                    userId: user.id,
                    articleId: article.id,
                });
            });
        });
        // 좋아요 저장 (중복 키 에러 무시)
        for (const favorite of favorites) {
            try {
                await prisma.favorite.create({
                    data: favorite,
                });
            }
            catch (error) {
                console.log("좋아요 생성 중 오류 발생 (중복 가능성):", error.message);
            }
        }
        // 좋아요 카운트 업데이트
        console.log("좋아요 카운트 업데이트 중...");
        for (const product of products) {
            const count = await prisma.favorite.count({
                where: { productId: product.id },
            });
            await prisma.product.update({
                where: { id: product.id },
                data: { favoriteCount: count },
            });
        }
        for (const article of articles) {
            const count = await prisma.favorite.count({
                where: { articleId: article.id },
            });
            await prisma.article.update({
                where: { id: article.id },
                data: { favoriteCount: count },
            });
        }
        console.log("테스트 데이터 생성 완료!");
    }
    catch (error) {
        console.error("테스트 데이터 생성 중 오류 발생:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// 시드 실행
seed();
