// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";
import prismaClient from "../../src/config/prisma";

const request = supertest("http://localhost:4040/api");

describe("GET /stream/", () => {
  const streamerId = "50";

  afterAll(async () => {
    await prismaClient.stream.delete({
      where: { streamerId: streamerId }
    });

    await prismaClient.user.delete({
      where: { id: streamerId }
    });
  });

  beforeAll(async () => {
    await prismaClient.user.create({
      data: {
        id: streamerId,
        username: "getReco",
        dispname: "getReco",
        email: "reco@reco.com"
      }
    });
  });

  it("should return 404 when no stream found", async () => {
    // Create a user
    const response = await request.get("/stream/recommended").send({});

    // Verify the HTTP status code
    expect(response.status).toBe(404);
  });

  it("should return 200 when streams found", async () => {
    const streamData = {
      streamerId: streamerId,
      previewImgUrl: "test.png",
      genre: "1,2,3"
    };

    // Create a user
    await request.post("/stream/create").send(streamData);

    await prismaClient.stream.update({
      where: { streamerId: streamerId },
      data: { active: true }
    });

    const response = await request.get("/stream/recommended");

    // Verify the HTTP status code
    expect(response.status).toBe(200);
  });
});
