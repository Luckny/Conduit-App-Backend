import "jest-extended";
import { TestDB } from "./TestDB";
import supertest from "supertest";
import { User } from "../src/core/model/User";
import App from "../src/App";
const api = supertest(App);

let db: TestDB;
// Tests data
let username: string = "testusername";
let email: string = "test@test.com";
let password: string = "testPassword";

let loggedInToken: string;

describe("User Test", () => {
   beforeAll(async () => {
      db = new TestDB();
      await db.connect();
   });

   describe("register", () => {
      describe("Given one parameter is missing", () => {
         it("should trow invalid parameter error", async () => {
            const params = [
               { user: { username: "test", email: "test@test.com" } },
               { user: { username: "test", password: "password" } },
               { user: { password: "test", email: "luckny@test.com" } },
               { user: {} },
            ];

            params.forEach(async (param) => {
               const res = await api.post("/api/users").send(param);
               expect(res.status).toBe(400);
               expect(res.type).toBe("application/json");
               expect(res.body).toHaveProperty("errors");
               expect(res.body.errors.body[0]).toContain("invalid parameter error");
            });
         });
      });

      describe("Given username, email and password", () => {
         it("should register a new user", async () => {
            const res = await api.post("/api/users").send({ user: { username, email, password } });
            expect(res.status).toBe(201);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("token");
         });
      });

      describe("given user already exist", () => {
         it("should throw already exist error", async () => {
            const res = await api.post("/api/users").send({ user: { username, email, password } });
            expect(res.status).toBe(409);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
         });
      });

      describe("given a duplicated username", () => {
         it("should throw already exist error", async () => {
            const res = await api
               .post("/api/users")
               .send({ user: { username, email: "newmail@test.com", password: "pass" } });

            expect(res.status).toBe(409);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("username: already exists");
         });
      });
   });

   describe("login", () => {
      describe("given email or password is missing", () => {
         it("should throw invalid parameter error", async () => {
            const params = [
               { user: { username: "Luckny" } },
               { user: { password: "password" } },
               { user: {} },
            ];

            params.forEach(async (param) => {
               const res = await api.post("/api/users/login").send(param);
               expect(res.status).toBe(400);
               expect(res.type).toBe("application/json");
               expect(res.body).toHaveProperty("errors");
               expect(res.body.errors.body[0]).toContain("invalid parameter error");
            });
         });
      });

      describe("given user does not exist", () => {
         it("should throw not found error", async () => {
            const res = await api
               .post("/api/users/login")
               .send({ user: { email: "nouser@mail.com", password } });
            expect(res.status).toBe(404);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("user not found");
         });
      });

      describe("given invalid password", () => {
         it("should throw unauthorized error", async () => {
            const res = await api
               .post("/api/users/login")
               .send({ user: { email, password: "invalidPassword" } });

            expect(res.status).toBe(401);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("invalid credentials");
         });
      });

      describe("given email and password", () => {
         it("should login the user", async () => {
            const res = await api.post("/api/users/login").send({ user: { email, password } });
            loggedInToken = res.body.user.token;
            expect(res.status).toBe(200);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("token");
         });
      });
   });

   describe("current user", () => {
      describe("given user is not logged in", () => {
         it("should return unauthorized error", async () => {
            const res = await api.get("/api/user");
            expect(res.status).toBe(401);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("No authorization token was found");
         });
      });

      describe("given user is logged in", () => {
         it("should return the user", async () => {
            let headers = {
               Authorization: `Token ${loggedInToken}`,
               "Content-Type": "application/json",
            };
            const res = await api.get("/api/user").set(headers);
            expect(res.status).toBe(200);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("user");
         });
      });
   });

   afterAll(async () => {
      await User.deleteMany({});
      await db.close();
   });
});

type ConduitUser = { user: { email: string; username: string; bio: string; image: string } };
