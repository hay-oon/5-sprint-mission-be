/*
  Warnings:

  - Added the required column `userId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- 먼저 관리자 사용자를 찾거나 생성합니다 (있다고 가정)
-- 데이터베이스에 이미 있는 사용자의 ID를 찾습니다 (첫 번째 사용자)
DO $$ 
DECLARE
  first_user_id TEXT;
BEGIN
  -- 첫 번째 사용자 ID 가져오기
  SELECT id INTO first_user_id FROM "User" LIMIT 1;
  
  IF first_user_id IS NULL THEN
    -- 사용자가 없는 경우, 임시 사용자 생성 (실제 구현에서는 적절한 관리자 정보 사용)
    INSERT INTO "User" (id, nickname, email, "encryptedPassword", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(), 
      'Admin', 
      'admin@example.com', 
      'temporaryPassword', 
      NOW(), 
      NOW()
    )
    RETURNING id INTO first_user_id;
  END IF;

  -- AlterTable: 기존 댓글에 기본 userId 추가
  ALTER TABLE "Comment" ADD COLUMN "userId" TEXT;
  UPDATE "Comment" SET "userId" = first_user_id WHERE "userId" IS NULL;
  ALTER TABLE "Comment" ALTER COLUMN "userId" SET NOT NULL;
END $$;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
