import app from "@src/app";
import Levels from "@src/__mocks__/mockedDb/levelsDefinition";
import request from "supertest";

describe("GET /levels", () => {
  beforeAll(async () => {
    await Levels.insert({
      id: 10,
      name: "Basic",
      reach_exp_pts: 0,
      hold_exp_pts: 0,
    });
    await Levels.insert({
      id: 20,
      name: "Bronze",
      reach_exp_pts: 100,
      hold_exp_pts: 50,
    });
    await Levels.insert({
      id: 30,
      name: "Silver",
      reach_exp_pts: 250,
      hold_exp_pts: 150,
    });
    await Levels.insert({
      id: 40,
      name: "Gold",
      reach_exp_pts: 500,
      hold_exp_pts: 300,
    });
    await Levels.insert({
      id: 50,
      name: "Platinum",
      reach_exp_pts: 1000,
      hold_exp_pts: 600,
    });
    await Levels.insert({
      id: 60,
      name: "Diamond",
      reach_exp_pts: 3000,
      hold_exp_pts: 2000,
    });
    await Levels.insert({
      id: 100,
      name: "Legendary",
      reach_exp_pts: undefined,
      hold_exp_pts: undefined,
    });
  });
  afterAll(async () => {
    await Levels.clear();
  });
  it("Should return 403 if logged out", async () => {
    const response = await request(app).get("/levels");
    expect(response.status).toBe(403);
  });
  it("Should return 200 if logged in", async () => {
    const response = await request(app)
      .get("/levels")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
  });
  it("Should not return reach and hold if they are null", async () => {
    const response = await request(app)
      .get("/levels")
      .set("authorization", "Bearer tester");
    expect(response.body[6]).toMatchObject({
      id: 100,
      name: "Legendary",
    });
    expect(response.body[6].reach).toBe(undefined);
    expect(response.body[6].hold).toBe(undefined);
  });
  it("Should return levels", async () => {
    const response = await request(app)
      .get("/levels")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(7);
    expect(response.body).toEqual([
      { id: 10, name: "Basic", reach: 0, hold: 0 },
      { id: 20, name: "Bronze", reach: 100, hold: 50 },
      { id: 30, name: "Silver", reach: 250, hold: 150 },
      { id: 40, name: "Gold", reach: 500, hold: 300 },
      { id: 50, name: "Platinum", reach: 1000, hold: 600 },
      { id: 60, name: "Diamond", reach: 3000, hold: 2000 },
      { id: 100, name: "Legendary" },
    ]);
  });
});
