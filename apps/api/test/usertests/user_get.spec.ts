// eslint-disable-next-line node/no-unpublished-import
import supertest from "supertest";

const request = supertest("http://localhost:4040/api");

describe("GET /user/:id", () => {
  it("should return 200 and user info if user exists", async () => {
    // Assuming user with id 'userId' exists in the database
    const userId = "uniqueId";

    const response = await request.get(`/user/${userId}`);

    expect(response.status).toBe(200);
  });
});
