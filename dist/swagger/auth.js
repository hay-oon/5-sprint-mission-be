"use strict";
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 사용자 인증 관련 API
 */
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *               - email
 *               - password
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 사용자 닉네임
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *               image:
 *                 type: string
 *                 description: 사용자 프로필 이미지 URL (선택사항)
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: 생성된 사용자 ID
 *                 nickname:
 *                   type: string
 *                   description: 사용자 닉네임
 *                 email:
 *                   type: string
 *                   description: 사용자 이메일
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       409:
 *         description: 이미 존재하는 이메일
 */
/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 description: 사용자 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nickname:
 *                       type: string
 *                     email:
 *                       type: string
 *                 accessToken:
 *                   type: string
 *                   description: JWT 액세스 토큰
 *                 refreshToken:
 *                   type: string
 *                   description: JWT 리프레시 토큰
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       401:
 *         description: 인증 실패 (잘못된 이메일 또는 비밀번호)
 */
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: 토큰 갱신
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 리프레시 토큰
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: 새로운 JWT 액세스 토큰
 *                 refreshToken:
 *                   type: string
 *                   description: 새로운 JWT 리프레시 토큰
 *       401:
 *         description: 유효하지 않은 리프레시 토큰
 */
