// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";

const request = supertest("http://localhost:4040/api");

describe("POST /stream/create", () => {
  it("should return 400 if streamerId, previewImgUrl or genre are missing", async () => {
    const streamData = {
      streamerId: "uniqueId",
      previewImgUrl: "test.png"
    };

    const response = await request.post("/stream/create").send(streamData);

    expect(response.status).toBe(400);
  });
});
