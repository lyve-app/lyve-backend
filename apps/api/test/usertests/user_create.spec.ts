// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";
import prismaClient from "../../src/config/prisma";

const request = supertest("http://localhost:4040/api");

describe("POST /user/create", () => {
  beforeAll(async () => {
    // Delete all current users in the database
    await prismaClient.user.deleteMany({});
  });

  afterAll(async () => {
    // Delete all users in the database after all tests have been executed
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

  it("should return 400 if id, username, or email is missing", async () => {
    const userData = {
      id: "uniqueId",
      username: "testUser"
      // Missing email
    };

    const response = await request.post("/user/create").send(userData);

    expect(response.status).toBe(400);
  });

  it("should return 409 if the user already exists", async () => {
    const userData = {
      id: "uniqueId",
      username: "testUser",
      email: "test@example.com"
    };

    const response = await request.post("/user/create").send(userData);

    expect(response.status).toBe(409);
  });
});
