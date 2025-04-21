"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: 댓글 고유 ID
 *         content:
 *           type: string
 *           description: 댓글 내용
 *         userId:
 *           type: string
 *           description: 댓글 작성자 ID
 *         articleId:
 *           type: string
 *           description: 댓글이 달린 게시글 ID (게시글 댓글일 경우만)
 *         productId:
 *           type: string
 *           description: 댓글이 달린 상품 ID (상품 댓글일 경우만)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 날짜
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 날짜
 */
/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: 댓글 관리 API
 */
/**
 * @swagger
 * /api/articles/{articleId}/comments:
 *   post:
 *     summary: 게시글에 새 댓글 작성
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *     responses:
 *       201:
 *         description: 댓글 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       401:
 *         description: 인증되지 않은 요청
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
/**
 * @swagger
 * /api/articles/{articleId}/comments:
 *   get:
 *     summary: 게시글의 댓글 목록 조회
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
/**
 * @swagger
 * /api/products/{productId}/comments:
 *   post:
 *     summary: 상품에 새 댓글 작성
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 댓글 내용
 *     responses:
 *       201:
 *         description: 댓글 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       401:
 *         description: 인증되지 않은 요청
 *       404:
 *         description: 상품을 찾을 수 없음
 */
/**
 * @swagger
 * /api/products/{productId}/comments:
 *   get:
 *     summary: 상품의 댓글 목록 조회
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 댓글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       404:
 *         description: 상품을 찾을 수 없음
 */
/**
 * @swagger
 * /api/comments/{id}:
 *   patch:
 *     summary: 댓글 수정
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 댓글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 수정할 댓글 내용
 *     responses:
 *       200:
 *         description: 댓글 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       401:
 *         description: 인증되지 않은 요청
 *       403:
 *         description: 권한 없음 (자신의 댓글만 수정 가능)
 *       404:
 *         description: 댓글을 찾을 수 없음
 */
/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: 댓글 삭제
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 댓글 ID
 *     responses:
 *       204:
 *         description: 댓글 삭제 성공
 *       401:
 *         description: 인증되지 않은 요청
 *       403:
 *         description: 권한 없음 (자신의 댓글만 삭제 가능)
 *       404:
 *         description: 댓글을 찾을 수 없음
 */
