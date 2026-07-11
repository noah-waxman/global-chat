const request = require("supertest");
const app = require("../app");
const db = require("../db");

afterAll(async () => {
  await db.pgp.end();
});

beforeEach(async () => {
  await db.none("TRUNCATE TABLE users, session RESTART IDENTITY CASCADE");
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

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const sessionCookie = cookies.find((cookie) =>
        cookie.startsWith("connect.sid="),
      );

      expect(sessionCookie).toBeDefined();
    });
  });
});

describe("POST /auth/login", () => {
  describe("given an email and password", () => {
    test("should respond with a 201 status code", async () => {
      await request(app)
        .post("/auth/register")
        .send({
          displayName: "test",
          email: "test@example.com",
          password: "password",
        })
        .expect(201);

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "password",
      });

      const userId = response.body["id"];

      const email = response.body["email"];

      const displayName = response.body["displayName"];

      const cookies = response.headers["set-cookie"];

      const sessionCookie = cookies.find((cookie) =>
        cookie.startsWith("connect.sid="),
      );

      expect(userId).toBeDefined();
      expect(email).toBe("test@example.com");
      expect(displayName).toBe("test");
      expect(cookies).toBeDefined();
      expect(sessionCookie).toBeDefined();

      console.log(response.headers);
    });
  });
});

describe("GET /auth/me", () => {
  describe("given a get request after logging in", () => {
    test("should response with user authenticated and user id", async () => {
      const agent = request.agent(app); // persist cookies

      await agent
        .post("/auth/register")
        .send({
          displayName: "test",
          email: "test@example.com",
          password: "password",
        })
        .expect(201);

      const response = await agent.get("/auth/me").expect(200);

      expect(response.body.isAuthenticated).toBe(true);
      expect(response.body.user).toBeDefined();
    });
  });

  describe("given a get request without logging in", () => {
    test("should respond with user not authenticated", async () => {
      const response = await request(app).get("/auth/me").expect(401);

      expect(response.body.isAuthenticated).toBe(false);
      expect(response.body.message).toBe("User is not authenticated");

      console.log(response.headers);
      console.log(response.body);
    });
  });
});
