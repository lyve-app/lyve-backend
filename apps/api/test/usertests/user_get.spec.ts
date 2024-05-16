// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";
import prismaClient from "../../src/config/prisma";

const request = supertest("http://localhost:4040/api");

describe("GET /user/:id", () => {
  const userId = "uniqueId";
  const nonExistingId = "nonExistingId";

  beforeEach(async () => {
    // Create a user before each test case
    const userData = {
      id: userId,
      username: "testUser",
      email: "test@example.com"
    };

    await request.post("/user/create").send(userData);
  });

  afterEach(async () => {
    // Delete the user after each test case
    await prismaClient.user.deleteMany({});
  });

  it("should return 200 and user info if user exists", async () => {
    const response = await request.get(`/user/${userId}`);

    expect(response.status).toBe(200);
    // Add more assertions as needed
  });

  it("should return 404 if user does not exist", async () => {
    const response = await request.get(`/user/${nonExistingId}`);

    expect(response.status).toBe(404);
    // Add more assertions as needed
  });
});
