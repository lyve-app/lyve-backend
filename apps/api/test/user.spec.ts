// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";
import prismaClient from "../src/config/prisma";

const request = supertest("http://localhost:4040/api");

describe("POST /user/create", () => {
  beforeAll(async () => {
    // Delete all current users in the database
    await prismaClient.user.deleteMany({});
  });

  it("should return 201 and create a user if all required fields are provided", async () => {
    const userData = {
      id: "uniqueId",
      username: "testUser",
      email: "test@example.com"
    };

    const response = await request.post("/user/create").send(userData);

    expect(response.status).toBe(201);
  });
});
