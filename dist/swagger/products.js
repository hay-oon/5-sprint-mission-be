/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - tags
 *       properties:
 *         id:
 *           type: string
 *           description: 상품 고유 ID
 *         userId:
 *           type: string
 *           description: 상품 작성자 ID
 *         name:
 *           type: string
 *           description: 상품명
 *         description:
 *           type: string
 *           description: 상품 설명
 *         price:
 *           type: integer
 *           description: 상품 가격
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 상품 태그
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: 상품 이미지 URL
 *         favoriteCount:
 *           type: integer
 *           description: 상품 좋아요 수
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 날짜
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 수정 날짜
 */
export {};
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: 상품 관리 API
 */
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: 새 상품 등록
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - tags
 *             properties:
 *               name:
 *                 type: string
 *                 description: 상품명
 *               description:
 *                 type: string
 *                 description: 상품 설명
 *               price:
 *                 type: integer
 *                 description: 상품 가격
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 상품 태그
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 상품 이미지 (최대 5개)
 *     responses:
 *       201:
 *         description: 상품 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       401:
 *         description: 인증되지 않은 요청
 *
 *   get:
 *     summary: 상품 목록 조회
 *     tags: [Products]
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
 *         description: 검색어 (상품명 또는 설명)
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: 태그로 필터링
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
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
 * /api/products/{id}:
 *   get:
 *     summary: 특정 상품 조회
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       200:
 *         description: 상품 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: 상품을 찾을 수 없음
 *       401:
 *         description: 인증되지 않은 요청
 *
 *   patch:
 *     summary: 상품 정보 수정
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 상품명
 *               description:
 *                 type: string
 *                 description: 상품 설명
 *               price:
 *                 type: integer
 *                 description: 상품 가격
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 상품 태그
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 상품 이미지 (최대 5개)
 *     responses:
 *       200:
 *         description: 상품 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       401:
 *         description: 인증되지 않은 요청
 *       403:
 *         description: 권한 없음 (자신의 상품만 수정 가능)
 *       404:
 *         description: 상품을 찾을 수 없음
 *
 *   delete:
 *     summary: 상품 삭제
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
 *     responses:
 *       204:
 *         description: 상품 삭제 성공
 *       401:
 *         description: 인증되지 않은 요청
 *       403:
 *         description: 권한 없음 (자신의 상품만 삭제 가능)
 *       404:
 *         description: 상품을 찾을 수 없음
 */
/**
 * @swagger
 * /api/products/{id}/favorite:
 *   post:
 *     summary: 상품 좋아요 추가
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
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
 *         description: 상품을 찾을 수 없음
 *
 *   delete:
 *     summary: 상품 좋아요 취소
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 상품 ID
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
 *         description: 상품을 찾을 수 없음 또는 좋아요가 되어있지 않음
 */
