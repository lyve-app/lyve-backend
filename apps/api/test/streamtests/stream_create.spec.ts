// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";
import prismaClient from "../../src/config/prisma";

const request = supertest("http://localhost:4040/api");

describe("POST /stream/create", () => {
  beforeEach(async () => {
    await prismaClient.stream.deleteMany({});
    await prismaClient.user.deleteMany({});
  });

  afterEach(async () => {
    await prismaClient.stream.deleteMany({});
    await prismaClient.user.deleteMany({});
  });

  it("should return 400 if streamerId, previewImgUrl or genre are missing", async () => {
    const streamData = {
      streamerId: "uniqueId",
      previewImgUrl: "test.png"
    };

    const response = await request.post("/stream/create").send(streamData);

    expect(response.status).toBe(400);
  });
});
