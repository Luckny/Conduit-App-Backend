import "jest-extended";
import { TestDB } from "./TestDB";
import { Article } from "../src/core/model/Article";
import App from "../src/App";
import supertest from "supertest";
const api = supertest(App);

let db: TestDB;

describe("Article Tests", () => {
   beforeAll(async () => {
      db = new TestDB("test-article");
      await db.connect();
   });

   afterAll(async () => {
      await Article.deleteMany({});
      await db.close();
   });
});
