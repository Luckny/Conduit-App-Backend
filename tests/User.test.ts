import "jest-extended";
import { TestDB } from "./TestDB";
import supertest from "supertest";
import { iUser, User } from "../src/core/model/User";
import App from "../src/App";
import { Response } from "superagent";
const api = supertest(App);

let db: TestDB;
// Tests data
let username: string = "testusername";
let email: string = "test@test.com";
let password: string = "testPassword";

let loggedInToken: string;
let headers: any;

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
            const params = [{ user: { username: "Luckny" } }, { user: { password: "password" } }];

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
            const res = await api.post("/api/users/login").send({ user: { email: "nouser@mail.com", password } });
            expect(res.status).toBe(404);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("user not found");
         });
      });

      describe("given invalid password", () => {
         it("should throw unauthorized error", async () => {
            const res = await api.post("/api/users/login").send({ user: { email, password: "invalidPassword" } });

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
            headers = {
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

   describe("update user", () => {
      describe("given no update field is provided", () => {
         it("should return invalid parameter", async () => {
            const res = await api.put("/api/user").set(headers).send({ user: {} });
            expect(res.status).toBe(400);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("invalid update parameter");
         });
      });

      describe("given invalid username field is provided", () => {
         it("should return invalid parameter : username", async () => {
            const params = [];

            const res = await api
               .put("/api/user")
               .set(headers)
               .send({ user: { username: null, email: "good@mail" } });
            expect(res.status).toBe(400);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("invalid update parameter: username");
         });
      });

      describe("given invalid email field is provided", () => {
         it("should return invalid parameter : email", async () => {
            const res = await api
               .put("/api/user")
               .set(headers)
               .send({ user: { image: "", email: "" } });
            expect(res.status).toBe(400);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("invalid update parameter: email");
         });
      });

      describe("given password field is missing", () => {
         it("should return invalid parameter: password", async () => {
            const res = await api
               .put("/api/user")
               .set(headers)
               .send({ user: { password: "" } });
            expect(res.status).toBe(400);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("invalid update parameter: password");
         });
      });

      describe("given an unexpected property in the update object", () => {
         it("should return unexpected field: {{name}}", async () => {
            const res = await api
               .put("/api/user")
               .set(headers)
               .send({ user: { bio: "change bio", malicious: "malicious code" } });
            expect(res.status).toBe(400);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
            expect(res.body.errors.body[0]).toContain("unexpected field: malicious");
         });
      });

      describe("given a valid request", () => {
         let user: iUser | null;
         let res: Response;
         it("should return a 200", async () => {
            user = await User.findOne({ username, email });
            console.log(user);
            res = await api
               .put("/api/user")
               .set(headers)
               .send({ user: { bio: "new bio", password: "newpassword" } });
            expect(res.status).toBe(200);
            expect(res.type).toBe("application/json");
         });

         it("should return the user with the modified field", async () => {
            const modifiedUser = await User.findOne({ username, email });
            expect(user?.username && res.body.user.username).toBe(modifiedUser?.username);
            expect(user?.bio).toBe("");
            expect(res.body.user.bio && modifiedUser?.bio).toBe("new bio");
         });

         it("should not re-hash the password if it is not modified", async () => {
            await api
               .put("/api/user")
               .set(headers)
               .send({ user: { bio: "darkness" } });
            // now login user password proving it wasnt modified
            const response = await api.post("/api/users/login").send({ user: { email, password: "newpassword" } });
            expect(response.status).toBe(200);
            expect(response.body.user.email).toBe(user?.email);
         });
      });
   });

   afterAll(async () => {
      await User.deleteMany({});
      await db.close();
   });
});

type ConduitUser = { user: { email: string; username: string; bio: string; image: string } };
