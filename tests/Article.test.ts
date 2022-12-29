import "jest-extended";
import { TestDB } from "./TestDB";
import { Article } from "../src/core/model/Article";
import { Tag } from "../src/core/model/Tag";
import App from "../src/App";
import supertest from "supertest";
import { User } from "../src/core/model/User";
const api = supertest(App);

let db: TestDB;
// test data
let authorUsername: string = "zoro";
let authorEmail: string = "roronoa.zo@op.gl";
let authorPassword: string = "curlybrowCantcook";

let headers; // for authentication

describe("Article Tests", () => {
   beforeAll(async () => {
      db = new TestDB("test-article");
      await db.connect();
      // register andlogin in article author
      await api
         .post("/api/users")
         .send({ user: { username: authorUsername, email: authorEmail, password: authorPassword } });
      const res = await api.post("/api/users/login").send({ user: { email: authorEmail, password: authorPassword } });
      headers = {
         Authorization: `Token ${res.body.user.token}`,
         "Content-Type": "application/json",
      };
   });

   it("should throw 500 error if data is not formated like {article: {...}}", async () => {
      const res = await api.post("/api/articles").set(headers).send({ title: "title" });
      expect(res.status).toBe(500);
      expect(res.body.errors.body[0]).toContain("internal server error");
   });

   describe("Create Article", () => {
      describe("given a user is logged in", () => {
         describe("if a required field is missing", () => {
            it("should throw validation error status 409", async () => {
               const res = await api
                  .post("/api/articles")
                  .set(headers)
                  .send({ article: { title: "wont work", description: "missing fields" } });
               expect(res.status).toBe(409);

               expect(res.body.errors.body[0]).toContain("`body` is required");
            });
         });

         it("should create an article", async () => {
            const res = await api
               .post("/api/articles")
               .set(headers)
               .send({
                  article: {
                     title: "Testing rest api",
                     description: "a test",
                     body: "this is all about testing rest apis",
                     tagList: ["testing", "api"],
                  },
               });
            expect(res.status).toBe(200);
            //tags should be created
            expect(Tag.findOne({ name: "testing" })).resolves.toBeTruthy();
         });
         it("tag list is not required", async () => {
            const res = await api
               .post("/api/articles")
               .set(headers)
               .send({
                  article: {
                     title: "i wont have a tag list",
                     description: "i will be succesfull",
                     body: "this is all about testing rest apis",
                  },
               });
            expect(res.status).toBe(200);
         });
      });

      describe("given no user is logged in", () => {
         it("should return 401: unauthorized error", async () => {
            const res = await api
               .post("/api/articles")
               .send({ title: "tile", description: "des", body: "will be 401 errror" });
            expect(res.status).toBe(401);
            expect(res.body.errors.body[0]).toContain("No authorization token was found");
         });
      });
   });

   afterAll(async () => {
      await Article.deleteMany({});
      await Tag.deleteMany({});
      await User.deleteMany({});
      await db.close();
   });
});
