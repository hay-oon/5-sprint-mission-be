"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: 게시글 고유 ID
 *         userId:
 *           type: string
 *           description: 게시글 작성자 ID
 *         title:
 *           type: string
 *           description: 게시글 제목
 *         content:
 *           type: string
 *           description: 게시글 내용
 *         favoriteCount:
 *           type: integer
 *           description: 게시글 좋아요 수
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
 *   name: Articles
 *   description: 게시글 관리 API
 */
/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: 새 게시글 작성
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *               content:
 *                 type: string
 *                 description: 게시글 내용
 *     responses:
 *       201:
 *         description: 게시글 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       401:
 *         description: 인증되지 않은 요청
 *
 *   get:
 *     summary: 게시글 목록 조회
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (제목 또는 내용)
 *     responses:
 *       200:
 *         description: 게시글 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 */
/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: 특정 게시글 조회
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 게시글 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: 게시글을 찾을 수 없음
 *       401:
 *         description: 인증되지 않은 요청
 *
 *   patch:
 *     summary: 게시글 수정
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *                 description: 게시글 제목
 *               content:
 *                 type: string
 *                 description: 게시글 내용
 *     responses:
 *       200:
 *         description: 게시글 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       401:
 *         description: 인증되지 않은 요청
 *       403:
 *         description: 권한 없음 (자신의 게시글만 수정 가능)
 *       404:
 *         description: 게시글을 찾을 수 없음
 *
 *   delete:
 *     summary: 게시글 삭제
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       204:
 *         description: 게시글 삭제 성공
 *       401:
 *         description: 인증되지 않은 요청
 *       403:
 *         description: 권한 없음 (자신의 게시글만 삭제 가능)
 *       404:
 *         description: 게시글을 찾을 수 없음
 */
/**
 * @swagger
 * /api/articles/{id}/favorite:
 *   post:
 *     summary: 게시글 좋아요 추가
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 좋아요 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favoriteCount:
 *                   type: integer
 *                   description: 업데이트된 좋아요 수
 *       401:
 *         description: 인증되지 않은 요청
 *       404:
 *         description: 게시글을 찾을 수 없음
 *
 *   delete:
 *     summary: 게시글 좋아요 취소
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 게시글 ID
 *     responses:
 *       200:
 *         description: 좋아요 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favoriteCount:
 *                   type: integer
 *                   description: 업데이트된 좋아요 수
 *       401:
 *         description: 인증되지 않은 요청
 *       404:
 *         description: 게시글을 찾을 수 없음 또는 좋아요가 되어있지 않음
 */
