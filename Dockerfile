# Node.js 베이스 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프리즈마 스키마 복사
COPY prisma ./prisma/

# 의존성 설치
RUN npm install

# Prisma 클라이언트 생성
RUN npx prisma generate

# 소스 코드 복사
COPY . .

# 환경 변수 설정
ENV NODE_ENV=production

# TypeScript 빌드
RUN npm run build

# 컨테이너 외부에 노출할 포트
EXPOSE 5005

# 앱 실행
CMD ["npm", "start"] 