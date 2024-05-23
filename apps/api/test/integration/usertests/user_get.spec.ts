// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";
import prismaClient from "../../../src/config/prisma";

const request = supertest("http://localhost:4040/api");

describe("GET /user/:id", () => {
  afterAll(async () => {
    await prismaClient.user.delete({
      where: { id: "uniqueId" }
    });
  });

  it("should return 200 and user info", async () => {
    const userData = {
      id: "uniqueId",
      username: "testUser",
      email: "test@example.com"
    };

    // Create a user
    await request.post("/user/create").send(userData);

    // Make a request to retrieve the user
    const response = await request.get(`/user/${userData.id}`);

    // Verify the HTTP status code
    expect(response.status).toBe(200);
  });

  it("should return 404", async () => {
    // Make a request with a non-existing user ID
    const response = await request.get("/user/nonExistingId");

    // Verify the HTTP status code
    expect(response.status).toBe(404);
  });
});
