import "jest-extended";
import { TestDB } from "./TestDB";
import supertest from "supertest";
import { iUser, User } from "../src/core/model/User";
import App from "../src/App";
const api = supertest(App);

let db: TestDB;
// test data
let myEmail: string = "bruce.wayne@wyn.com";
let myUsername: string = "ImBatman";
let myPassword: string = "Catwoman<3";

let profileEmail: string = "selena@wyn.com";
let profileUsername: string = "CatWoman";
let profilePassword: string = "iKindaHateBruce";
let headers: any;

describe("Profile Test", () => {
   beforeAll(async () => {
      db = new TestDB("test-profile");
      await db.connect();

      // register a two users
      await api.post("/api/users").send({ user: { username: myUsername, email: myEmail, password: myPassword } });
      await api
         .post("/api/users")
         .send({ user: { username: profileUsername, email: profileEmail, password: profilePassword } });

      // login with my Email
      const res = await api.post("/api/users/login").send({ user: { email: myEmail, password: myPassword } });
      headers = {
         Authorization: `Token ${res.body.user.token}`,
         "Content-Type": "application/json",
      };
   });

   describe("Get a profile", () => {
      describe("given a valid username", () => {
         describe("if a profile with the username exists", () => {
            let profile;
            it("should return a 200", async () => {
               const res = await api.get(`/api/profiles/${profileUsername}`);
               expect(res.status).toBe(200);
               profile = res.body.profile;
            });
            it("profile object should match test data with format {username, bio, image, following}", async () => {
               expect(profile).toMatchObject({ username: profileUsername, bio: "", image: "", following: false });
            });
         });
         describe("if no profile with the username exist", () => {
            it("should throw a not found error", async () => {
               const res = await api.get("/api/profiles/fakeUsername");
               expect(res.status).toBe(404);
               expect(res.body).toHaveProperty("errors");
               expect(res.body.errors.body[0]).toContain("user profile not found");
            });
         });
      });
   });

   describe("Follow a profile", () => {
      describe("given a user is authenticated", () => {
         describe("if a profile with the username exist", () => {
            let profile;
            it("should return a 200", async () => {
               const res = await api.post(`/api/profiles/${profileUsername}/follow`).set(headers);
               expect(res.status).toBe(200);
               profile = res.body.profile;
            });
            it("profile object should match test data with format {username, bio, image, following: true}", async () => {
               expect(profile).toMatchObject({ username: profileUsername, bio: "", image: "", following: true });
            });
            it("get profile should return following: true", async () => {
               const res = await api.get(`/api/profiles/${profileUsername}`).set(headers);
               expect(res.body.profile.following).toBe(true);
            });
         });

         describe("if user tries to follow themself", () => {
            it("should default following to true", async () => {
               const res = await api.post(`/api/profiles/${myUsername}/follow`).set(headers);
               expect(res.status).toBe(200);
               expect(res.body.profile.username).toBe(myUsername);
               expect(res.body.profile.following).toBe(true);
            });
         });

         describe("if no profile with the username exist", () => {
            it("should throw a not found error", async () => {
               const res = await api.post("/api/profiles/fakeUsername/follow").set(headers);
               expect(res.status).toBe(404);
               expect(res.body).toHaveProperty("errors");
               expect(res.body.errors.body[0]).toContain("user profile not found");
            });
         });
      });

      describe("given no user is authenticated", () => {
         it("should return a not authorized error", async () => {
            const res = await api.post(`/api/profiles/${profileUsername}/follow`);
            expect(res.status).toBe(401);
            expect(res.body.errors.body[0]).toContain("No authorization token was found");
         });
      });
   });

   describe("Unfollow a profile", () => {
      describe("given a user is authenticated", () => {
         describe("if a profile with the username exist and the logged in user was following it", () => {
            let profile;
            it("should return a 200", async () => {
               const res = await api.delete(`/api/profiles/${profileUsername}/follow`).set(headers);
               expect(res.status).toBe(200);
               profile = res.body.profile;
            });
            it("profile object should match test data with format {username, bio, image, following: false}", async () => {
               expect(profile).toMatchObject({ username: profileUsername, bio: "", image: "", following: false });
            });
            it("get profile should return following: false", async () => {
               const res = await api.get(`/api/profiles/${profileUsername}`).set(headers);
               expect(res.body.profile.following).toBe(false);
            });

            describe("if logged in user is not following the profile", () => {
               it("should return 401 unauthorized error", async () => {
                  const res = await api.delete(`/api/profiles/${profileUsername}/follow`).set(headers);
                  expect(res.status).toBe(404);
                  expect(res.body.errors.body[0]).toContain("user not found in following list");
               });
            });
         });

         describe("if user tries to unfollow themself", () => {
            it("should default following to true", async () => {
               const res = await api.delete(`/api/profiles/${myUsername}/follow`).set(headers);
               expect(res.status).toBe(200);
               expect(res.body.profile.username).toBe(myUsername);
               expect(res.body.profile.following).toBe(true);
            });
         });

         describe("if no profile with the username exist", () => {
            it("should throw a not found error", async () => {
               const res = await api.delete("/api/profiles/fakeUsername/follow").set(headers);
               expect(res.status).toBe(404);
               expect(res.body).toHaveProperty("errors");
               expect(res.body.errors.body[0]).toContain("user profile not found");
            });
         });
      });

      describe("given no user is authenticated", () => {
         it("should return a not authorized error", async () => {
            const res = await api.post(`/api/profiles/${profileUsername}/follow`);
            expect(res.status).toBe(401);
            expect(res.body.errors.body[0]).toContain("No authorization token was found");
         });
      });
   });
   afterAll(async () => {
      await User.deleteMany({});
      await db.close();
   });
});

type ConduitUser = { user: { email: string; username: string; bio: string; image: string } };
