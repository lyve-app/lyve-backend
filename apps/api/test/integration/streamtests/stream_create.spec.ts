import prismaClient from "../../../src/config/prisma";
// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";

const request = supertest("http://localhost:4040/api");

describe("POST /stream/create", () => {
  const testId = "100";

  afterAll(async () => {
    await prismaClient.stream.delete({ where: { streamerId: testId } });
    await prismaClient.user.delete({ where: { id: testId } });
  });

  beforeAll(async () => {
    await prismaClient.user.create({
      data: {
        id: testId,
        username: "testUser",
        dispname: "test100",
        email: "test100@example.com"
      }
    });
  });

  it("should return 400 if streamerId, previewImgUrl or genre are missing", async () => {
    const streamData = {
      streamerId: "uniqueId",
      previewImgUrl: "test.png"
    };

    const response = await request.post("/stream/create").send(streamData);

    expect(response.status).toBe(400);
  });

  it("should return 201 if a stream has been created", async () => {
    const streamData = {
      streamerId: testId,
      previewImgUrl: "test.png",
      genre: "1,2,3"
    };

    const response = await request.post("/stream/create").send(streamData);

    expect(response.status).toBe(201);
  });
});
