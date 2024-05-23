import { PrismaClient } from "@prisma/client";
// eslint-disable-next-line node/no-unpublished-import
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";

import prismaClient from "./config";

jest.mock("./config", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock =
  prismaClient as unknown as DeepMockProxy<PrismaClient>;
