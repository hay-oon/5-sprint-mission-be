/*
  Warnings:

  - Added the required column `nickname` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Article" ADD COLUMN "nickname" TEXT NOT NULL DEFAULT '익명';
-- Update existing records with a default nickname if needed
UPDATE "Article" SET nickname = '익명' WHERE nickname IS NULL;
