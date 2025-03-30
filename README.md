# 상품 관리 API

## 이미지 업로드 기능

상품 등록 및 수정 시 이미지 업로드 기능을 제공합니다.

### 이미지 업로드 API 사용 방법

#### 상품 등록 시

- 요청 URL: `POST /api/products`
- Content-Type: `multipart/form-data`
- 요청 헤더: `Authorization: Bearer {token}`
- 요청 바디:
  - `name`: 상품명 (필수)
  - `description`: 상품 설명 (필수)
  - `price`: 상품 가격 (필수)
  - `tags`: 태그 배열 (JSON 형식의 문자열, 예: `'["태그1", "태그2"]'`)
  - `images`: 이미지 파일 (최대 5개, form-data `file` 형식)

#### 상품 수정 시

- 요청 URL: `PATCH /api/products/:id`
- Content-Type: `multipart/form-data`
- 요청 헤더: `Authorization: Bearer {token}`
- 요청 바디:
  - `name`: 상품명 (선택)
  - `description`: 상품 설명 (선택)
  - `price`: 상품 가격 (선택)
  - `tags`: 태그 배열 (JSON 형식의 문자열, 예: `'["태그1", "태그2"]'`, 선택)
  - `images`: 이미지 파일 (최대 5개, form-data `file` 형식, 선택)

### 응답 형식

```json
{
  "id": "상품 ID",
  "name": "상품명",
  "description": "상품 설명",
  "price": 10000,
  "tags": ["태그1", "태그2"],
  "images": [
    "/uploads/1234567890-image1.jpg",
    "/uploads/1234567890-image2.jpg"
  ],
  "createdAt": "2023-01-01T00:00:00.000Z",
  "favoriteCount": 0,
  "ownerId": "사용자 ID",
  "ownerNickname": "사용자 닉네임",
  "isFavorite": false
}
```

### 주의사항

- 이미지 파일은 jpg, jpeg, png, gif 형식만 지원합니다.
- 각 이미지 파일 크기는 최대 5MB로 제한됩니다.
- 이미지는 최대 5개까지 업로드할 수 있습니다.
- 상품 수정 시 새 이미지가 업로드되면 기존 이미지는 모두 삭제됩니다.
