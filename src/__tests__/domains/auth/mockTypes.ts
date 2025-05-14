import { jest } from "@jest/globals";

type AnyFunction = (...args: any[]) => any;

export interface MockPrismaUser {
  findFirst: jest.Mock;
  create: jest.Mock;
}

export interface MockBcrypt {
  hash: jest.Mock;
  compare: jest.Mock;
}

export interface MockJwt {
  sign: jest.Mock;
}
