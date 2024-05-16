// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";
import prismaClient from "../../src/config/prisma";
import { after, before } from "node:test";

const request = supertest("http://localhost:4040/api");

describe("GET /user/:id", () => {
  before(async () => {
    // Create a user before each test case
    const userData = {
      id: "uniqueId",
      username: "testUser",
      email: "test@example.com"
    };

    await request.post("/user/create").send(userData);
  });

  after(async () => {
    // Delete the user after each test case
    await prismaClient.user.deleteMany({});
  });

  it("should return 200 and user info if user exists", async () => {
    const response = await request.get("/user/uniqueId");

    expect(response.status).toBe(200);
    // Add more assertions as needed
  });
});
