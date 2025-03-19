/*
  Warnings:

  - You are about to drop the column `likeCount` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,articleId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_articleId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "likeCount",
ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN     "articleId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- DropTable
DROP TABLE "Like";

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_articleId_key" ON "Favorite"("userId", "articleId");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
