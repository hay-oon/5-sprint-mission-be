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

## TypeScript 마이그레이션 완료

JavaScript 코드를 TypeScript로 성공적으로 마이그레이션했습니다. 이제 모든 코드는 정적 타입 체크를 통과하며, 타입 안전성이 보장됩니다.

### 완료된 작업

1. 모든 JavaScript 파일 삭제 및 TypeScript 파일로 대체
2. TypeScript 설정 (tsconfig.json) 구성 및 필수 의존성 설치
3. 타입 안전성 개선을 위한 인터페이스 및 타입 정의:

   - Express 타입 정의 개선 (types/express.d.ts)
   - 에러 처리 유틸리티 추가 (utils/errorHandler.ts)
   - 모델 인터페이스 정의 (types/models.d.ts)
   - Prisma 클라이언트 초기화 방식 통일 (prisma/index.ts)

4. 데이터 접근 계층 개선:

   - userId 타입을 string | number로 수정하여 타입 호환성 개선
   - CommentRequest 인터페이스를 Request 확장으로 대체
   - 서비스 메서드에 올바른 타입 정의 적용

5. Express 라우터 타입 문제 해결:

   - 라우터 핸들러 함수 반환 타입 any로 수정
   - 컨트롤러 함수 래핑을 통한 타입 호환성 확보
   - 미들웨어 체인의 타입 호환성 개선

6. 모듈 내보내기 일관성 개선:

   - 서비스 함수와 컨트롤러 함수 이름 충돌 해결
   - 모듈 내보내기와 로컬 변수명 일치화

7. 데이터 모델 관련 타입 수정:
   - seed.ts의 타입 오류 해결
   - 데이터 구조체 인터페이스 정의 및 적용

### 핵심 개선 사항

1. **타입 안전성**: 런타임 이전에 잠재적인 타입 오류 감지
2. **자동 완성 지원**: 개발자 생산성 향상
3. **코드 품질 개선**: 명시적인 타입 정의로 코드 가독성 향상
4. **유지보수성 향상**: 리팩토링 시 타입 체크를 통한 안전성 확보

이제 코드베이스는 TypeScript의 모든 이점을 활용할 수 있게 되었으며, `tsc --noEmit` 명령으로 타입 체크를 통과합니다.

### 실행 방법

TypeScript로 개발 서버 실행:

```bash
npm run dev
```

TypeScript 코드 타입 체크:

```bash
npm run typecheck
```

프로덕션 빌드:

```bash
npm run build && npm start
```

## 주요 변경사항

### Express 라우터 핸들러 타입 문제 해결

TypeScript 마이그레이션 과정에서 Express 라우터 핸들러 함수의 타입 호환성 문제가 발생했습니다. 이 문제는 라우터 핸들러가 `Promise<void>`를 반환하도록 함으로써 해결했습니다. 주요 변경사항은 다음과 같습니다:

1. 모든 컨트롤러 함수에 명시적 반환 타입 `Promise<void>` 추가
2. 응답 객체(`res`)를 사용하여 클라이언트에 응답을 보낸 후에도 명시적으로 `return`을 하지 않도록 수정
3. 에러 핸들링 부분에서도 일관된 타입 반환 체계 유지

이러한 변경으로 Express 라우터와 TypeScript 타입 시스템 간의 호환성이 개선되었으며, 라우터 정의 시 발생하던 다음과 같은 타입 오류가 해결되었습니다:

```
Type 'Promise<Response<any, Record<string, any>> | undefined>' is not assignable to type 'void | Promise<void>'
```

### 중복 코드 제거 및 모듈화

서비스 파일에서 반복되는 코드 패턴을 제거하고 모듈화하여 코드 유지보수성과 가독성을 개선했습니다. 주요 변경사항은 다음과 같습니다:

1. 쿼리 헬퍼 함수 구현:

   - 페이지네이션 로직을 `createPaginationQuery` 함수로 추출
   - 검색 조건 생성을 위한 `createSearchCondition` 유틸리티 구현
   - 정렬 조건 생성을 위한 `createOrderByCondition` 함수 추가

2. 데이터 가공 유틸리티 함수:

   - 응답 객체 생성을 위한 `createResponseDto` 함수 구현
   - 작성자 정보 처리를 위한 `formatUserInfo` 유틸리티 추가
   - 좋아요 상태 처리를 위한 `attachFavoriteStatus` 함수 구현

3. 반복 패턴 일관화:
   - 트랜잭션 사용 패턴 통일
   - 에러 처리 로직 중앙화
   - 권한 검증 로직 분리 및 재사용

이러한 개선을 통해 코드 중복이 최소화되고, 기능 변경 시 여러 곳을 수정할 필요 없이 한 곳만 수정하면 되도록 구조가 개선되었습니다. 또한, 새로운 기능 추가 시 기존의 유틸리티 함수를 활용할 수 있어 개발 생산성이 향상되었습니다.

### 응답 형식 표준화

API 응답 형식을 표준화하여 클라이언트와의 일관된 인터페이스를 제공합니다. 주요 변경사항은 다음과 같습니다:

1. 응답 DTO 생성 함수 구현:

   - `createArticleResponseDto`
   - `createProductResponseDto`
   - `createListResponse`

2. 응답 형식 통일:

   - 모든 컨트롤러에서 `res.json()` 사용
   - 에러 응답 형식 일관성 유지

3. 메타데이터 일관성:
   - 페이지네이션 정보 통일
   - 총 개수 필드명 표준화 (`totalCount`)
   - 배열 응답에는 항상 배열 명칭과 메타데이터 포함

이러한 변경으로 클라이언트는 API 응답 형식을 예측할 수 있게 되어 프론트엔드 개발 효율성이 향상됩니다.
