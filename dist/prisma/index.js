import { PrismaClient } from "@prisma/client";
// 단일 Prisma 인스턴스를 생성하고 내보냅니다.
export const db = new PrismaClient();
