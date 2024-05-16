// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";
import prismaClient from "../../src/config/prisma";

const request = supertest("http://localhost:4040/api");

describe("POST /user/create", () => {
  afterAll(async () => {
    await prismaClient.user.delete({
      where: { id: "test1" }
    });
  });

  it("should return 201 and create a user if all required fields are provided", async () => {
    const userData = {
      id: "test1",
      username: "testUser",
      email: "test1@example.com"
    };

    const response = await request.post("/user/create").send(userData);

    expect(response.status).toBe(201);
  });

  it("should return 400 if id, username, or email is missing", async () => {
    const userData = {
      id: "uniqueId",
      username: "testUser"
    };

    const response = await request.post("/user/create").send(userData);

    expect(response.status).toBe(400);
  });

  it("should return 409 if the user already exists", async () => {
    const userData = {
      id: "test1",
      username: "testUser",
      email: "test1@example.com"
    };

    const response = await request.post("/user/create").send(userData);

    expect(response.status).toBe(409);
  });
});
