import "jest-extended";
import { TestDB } from "./TestDB";
import supertest from "supertest";
import { User } from "../src/model/User";
import App from "../src/App";
const api = supertest(App);

let db: TestDB;
// Tests data
const registerInfo = {
   user: { username: "Luckny", email: "luckny@test.com", password: "password" },
};
describe("User Test", () => {
   beforeAll(async () => {
      db = new TestDB();
      await db.connect();
   });

   describe("Given one parameter is missing", () => {
      it("should trow invalid parameter error", async () => {
         const params = [
            { user: { username: "Luckny", email: "luckny@test.com" } },
            { user: { username: "Luckny", password: "password" } },
            { user: { password: "Luckny", email: "luckny@test.com" } },
            { user: {} },
         ];

         params.forEach(async (param) => {
            const res = await api.post("/api/users").send(param);
            expect(res.status).toBe(400);
            expect(res.type).toBe("application/json");
            expect(res.body).toHaveProperty("errors");
         });
      });
   });

   describe("Given username, email and password", () => {
      it("should register a new user", async () => {
         const res = await api.post("/api/users").send(registerInfo);
         expect(res.status).toBe(201);
         expect(res.type).toBe("application/json");
         expect(res.body).toHaveProperty("user");
      });
   });

   describe("given user already exist", () => {
      it("should throw already exist error", async () => {
         const res = await api.post("/api/users").send(registerInfo);
         expect(res.status).toBe(409);
         expect(res.type).toBe("application/json");
         expect(res.body).toHaveProperty("errors");
      });
   });

   describe("given a duplicated username", () => {
      it("should throw already exist error with username already exist message", async () => {
         const res = await api
            .post("/api/users")
            .send({ user: { username: "Luckny", email: "newmail@test.com", password: "pass" } });

         expect(res.status).toBe(409);
         expect(res.type).toBe("application/json");
         expect(res.body).toHaveProperty("errors");
         expect(res.body.errors.body[0]).toContain("username: already exists");
      });
   });

   afterAll(async () => {
      await User.deleteMany({});
      await db.close();
   });
});

type ConduitUser = { user: { email: string; username: string; bio: string; image: string } };
