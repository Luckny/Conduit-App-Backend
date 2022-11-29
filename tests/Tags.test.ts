import "jest-extended";
import { TestDB } from "./TestDB";
import supertest from "supertest";
import { Tag } from "../src/core/model/Tag";
import App from "../src/App";
const api = supertest(App);

let db: TestDB;

describe("Tags Test", () => {
   beforeAll(async () => {
      db = new TestDB("test-tags");
      await db.connect();
      const tag1 = new Tag({ name: "computers" });
      const tag2 = new Tag({ name: "coding" });
      const tag3 = new Tag({ name: "testing" });

      await tag1.save();
      await tag2.save();
      await tag3.save();
   });

   it("should be able to return a list of tags", async () => {
      const res = await api.get("/api/tags");
      expect(res.status).toBe(200);
      expect(res.body.tags).toInclude("computers");
      expect(res.body.tags).toInclude("coding");
      expect(res.body.tags).toInclude("testing");
   });

   describe("given no tags have been created", () => {
      it("should return 404 no tags found", async () => {
         await Tag.deleteMany({});
         const res = await api.get("/api/tags");
         expect(res.status).toBe(404);
         expect(res.body.errors.body[0]).toContain("no tags found");
      });
   });

   afterAll(async () => {
      await Tag.deleteMany({});
      await db.close();
   });
});

type ConduitUser = { user: { email: string; username: string; bio: string; image: string } };
