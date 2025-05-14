import { PrismaClient } from "@prisma/client";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from "../../../domains/products/product.service";
import { unauthorizedError, notFoundError } from "../../../utils/errorHandler";

// Prisma 클라이언트 모킹
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    favorite: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// prisma 인스턴스 가져오기
const prisma = new PrismaClient();

describe("Product Service Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProduct", () => {
    const mockUser = {
      id: "user1",
      nickname: "testUser",
    };

    const mockProductData = {
      name: "테스트 상품",
      description: "테스트 상품 설명",
      price: 10000,
      tags: ["태그1", "태그2"],
      images: ["image1.jpg"],
      userId: "user1",
    };

    it("권한이 있는 사용자가 상품을 생성할 수 있다", async () => {
      // Given
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.product.create as jest.Mock).mockResolvedValue({
        ...mockProductData,
        id: "product1",
        createdAt: new Date(),
        updatedAt: new Date(),
        favoriteCount: 0,
      });

      // When
      const result = await createProduct(
        mockProductData.name,
        mockProductData.description,
        mockProductData.price,
        mockProductData.tags,
        mockProductData.images,
        mockProductData.userId
      );

      // Then
      expect(result).toHaveProperty("id");
      expect(result.name).toBe(mockProductData.name);
      expect(result.ownerId).toBe(mockUser.id);
      expect(prisma.product.create).toHaveBeenCalledTimes(1);
    });

    it("존재하지 않는 사용자는 상품을 생성할 수 없다", async () => {
      // Given
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // When & Then
      await expect(
        createProduct(
          mockProductData.name,
          mockProductData.description,
          mockProductData.price,
          mockProductData.tags,
          mockProductData.images,
          "invalidUserId"
        )
      ).rejects.toThrow("유효하지 않은 사용자입니다.");
    });
  });

  describe("getProducts", () => {
    const mockProducts = [
      {
        id: "product1",
        name: "상품1",
        description: "설명1",
        price: 10000,
        tags: ["태그1"],
        images: ["image1.jpg"],
        userId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        favoriteCount: 0,
      },
    ];

    const mockUsers = [
      {
        id: "user1",
        nickname: "testUser",
      },
    ];

    it("상품 목록을 조회할 수 있다", async () => {
      // Given
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.product.count as jest.Mock).mockResolvedValue(1);

      // When
      const result = await getProducts(1, 10, "recent");

      // Then
      expect(result.list).toHaveLength(1);
      expect(result.list[0].name).toBe("상품1");
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateProduct", () => {
    const mockProduct = {
      id: "product1",
      name: "상품1",
      description: "설명1",
      price: 10000,
      tags: ["태그1"],
      images: ["image1.jpg"],
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteCount: 0,
    };

    const mockUser = {
      id: "user1",
      nickname: "testUser",
    };

    it("상품 소유자는 상품을 수정할 수 있다", async () => {
      // Given
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue({
        ...mockProduct,
        name: "수정된 상품",
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // When
      const result = await updateProduct(
        "product1",
        "수정된 상품",
        "수정된 설명",
        15000,
        ["태그2"],
        ["image2.jpg"],
        "user1"
      );

      // Then
      expect(result.name).toBe("수정된 상품");
      expect(prisma.product.update).toHaveBeenCalledTimes(1);
    });

    it("상품 소유자가 아닌 사용자는 상품을 수정할 수 없다", async () => {
      // Given
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      // When & Then
      await expect(
        updateProduct(
          "product1",
          "수정된 상품",
          "수정된 설명",
          15000,
          ["태그2"],
          ["image2.jpg"],
          "user2"
        )
      ).rejects.toThrow("상품을 수정할 권한이 없습니다.");
    });
  });

  describe("deleteProduct", () => {
    const mockProduct = {
      id: "product1",
      name: "상품1",
      description: "설명1",
      price: 10000,
      tags: ["태그1"],
      images: ["image1.jpg"],
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteCount: 0,
    };

    const mockUser = {
      id: "user1",
      nickname: "testUser",
    };

    it("상품 소유자는 상품을 삭제할 수 있다", async () => {
      // Given
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // When
      const result = await deleteProduct("product1", "user1");

      // Then
      expect(result).toHaveProperty("id", "product1");
      expect(prisma.product.delete).toHaveBeenCalledTimes(1);
    });

    it("상품 소유자가 아닌 사용자는 상품을 삭제할 수 없다", async () => {
      // Given
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      // When & Then
      await expect(deleteProduct("product1", "user2")).rejects.toThrow(
        "상품을 삭제할 권한이 없습니다."
      );
    });

    it("존재하지 않는 상품은 삭제할 수 없다", async () => {
      // Given
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      // When & Then
      await expect(deleteProduct("nonexistent", "user1")).rejects.toThrow(
        "상품을 찾을 수 없습니다."
      );
    });
  });

  describe("getProductById", () => {
    const mockProduct = {
      id: "product1",
      name: "상품1",
      description: "설명1",
      price: 10000,
      tags: ["태그1"],
      images: ["image1.jpg"],
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteCount: 0,
    };

    const mockUser = {
      id: "user1",
      nickname: "testUser",
    };

    it("존재하는 상품 ID로 상품 정보를 조회할 수 있다", async () => {
      // Given
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.favorite.findFirst as jest.Mock).mockResolvedValue(null);

      // When
      const result = await getProductById("product1");

      // Then
      expect(result).not.toBeNull();
      expect(result?.id).toBe("product1");
      expect(result?.ownerNickname).toBe("testUser");
      expect(result?.isFavorite).toBe(false);
    });

    it("로그인한 사용자가 좋아요를 누른 상품을 조회하면 isFavorite이 true로 표시된다", async () => {
      // Given
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.favorite.findFirst as jest.Mock).mockResolvedValue({
        userId: "user2",
        productId: "product1",
      });

      // When
      const result = await getProductById("product1", "user2");

      // Then
      expect(result).not.toBeNull();
      expect(result?.isFavorite).toBe(true);
    });

    it("존재하지 않는 상품 ID로 조회하면 null을 반환한다", async () => {
      // Given
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      // When
      const result = await getProductById("nonexistent");

      // Then
      expect(result).toBeNull();
    });
  });

  describe("addFavorite", () => {
    const mockProduct = {
      id: "product1",
      name: "상품1",
      description: "설명1",
      price: 10000,
      tags: ["태그1"],
      images: ["image1.jpg"],
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteCount: 1, // 좋아요 추가 후 카운트 증가
    };

    const mockUser = {
      id: "user1",
      nickname: "testUser",
    };

    it("사용자가 상품에 좋아요를 추가할 수 있다", async () => {
      // Given
      (prisma.favorite.create as jest.Mock).mockResolvedValue({
        userId: "user2",
        productId: "product1",
      });
      (prisma.product.update as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // When
      const result = await addFavorite("product1", "user2");

      // Then
      expect(result).not.toBeNull();
      expect(result.id).toBe("product1");
      expect(result.favoriteCount).toBe(1);
      expect(result.isFavorite).toBe(true);
      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: "user2",
          productId: "product1",
        },
      });
      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "product1" },
          data: { favoriteCount: { increment: 1 } },
        })
      );
    });
  });

  describe("removeFavorite", () => {
    const mockProduct = {
      id: "product1",
      name: "상품1",
      description: "설명1",
      price: 10000,
      tags: ["태그1"],
      images: ["image1.jpg"],
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteCount: 0, // 좋아요 제거 후 카운트 감소
    };

    const mockUser = {
      id: "user1",
      nickname: "testUser",
    };

    it("사용자가 상품에서 좋아요를 제거할 수 있다", async () => {
      // Given
      (prisma.favorite.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.product.update as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // When
      const result = await removeFavorite("product1", "user2");

      // Then
      expect(result).not.toBeNull();
      expect(result.id).toBe("product1");
      expect(result.favoriteCount).toBe(0);
      expect(result.isFavorite).toBe(false);
      expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: "user2",
          productId: "product1",
        },
      });
      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "product1" },
          data: { favoriteCount: { decrement: 1 } },
        })
      );
    });
  });

  describe("checkFavorite", () => {
    it("사용자가 상품에 좋아요를 눌렀는지 확인할 수 있다 (좋아요 있음)", async () => {
      // Given
      (prisma.favorite.findFirst as jest.Mock).mockResolvedValue({
        userId: "user1",
        productId: "product1",
      });

      // When
      const result = await checkFavorite("product1", "user1");

      // Then
      expect(result).toBe(true);
      expect(prisma.favorite.findFirst).toHaveBeenCalledWith({
        where: {
          userId: "user1",
          productId: "product1",
        },
      });
    });

    it("사용자가 상품에 좋아요를 눌렀는지 확인할 수 있다 (좋아요 없음)", async () => {
      // Given
      (prisma.favorite.findFirst as jest.Mock).mockResolvedValue(null);

      // When
      const result = await checkFavorite("product1", "user1");

      // Then
      expect(result).toBe(false);
      expect(prisma.favorite.findFirst).toHaveBeenCalledWith({
        where: {
          userId: "user1",
          productId: "product1",
        },
      });
    });
  });
});
