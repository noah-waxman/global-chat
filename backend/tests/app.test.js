const request = require("supertest");
const app = require("../app");
const db = require("../db");

afterAll(async () => {
  await db.pgp.end();
});

describe("POST /auth/register", () => {
  describe("given a username, display name, and password", () => {
    test("should respond with a 201 status code", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          displayName: "test",
          email: "test@example.com",
          password: "password",
        })
        .expect(201);
    });
  });
});
