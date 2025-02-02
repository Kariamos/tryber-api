import app from "@src/app";
import deleteFromS3 from "@src/features/deleteFromS3";
import Profile from "@src/__mocks__/mockedDb/profile";
import WpUsers from "@src/__mocks__/mockedDb/wp_users";
import bugMedia from "@src/__mocks__/mockedDb/bugMedia";
import request from "supertest";

jest.mock("@src/features/deleteFromS3");

process.env.MEDIA_BUCKET = "media.bucket";
process.env.MEDIA_FOLDER = "media";

beforeAll(async () => {
  (deleteFromS3 as jest.Mock).mockImplementation(
    ({ url }: { url: string }): Promise<any> => Promise.resolve(true)
  );
  await Profile.insert();
  await WpUsers.insert();
});

afterAll(async () => {
  await WpUsers.clear();
  await Profile.clear();
});
describe("Route DELETE /media", () => {
  beforeAll(async () => {});
  afterAll(async () => {});
  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).delete("/media");
    expect(response.status).toBe(403);
  });
  it("Should answer 404 if try to send bad url", async () => {
    const response = await request(app)
      .delete("/media")
      .set("authorization", "Bearer tester")
      .send({ url: "https://google.com" })
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Bad file path");
  });
  it("Should answer 404 if try to send url in a folder of another user", async () => {
    const response = await request(app)
      .delete("/media")
      .send({
        url: "https://s3.eu-west-1.amazonaws.com/media.bucket/media/T169/image_123456789.png",
      })
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Bad file path");
  });
  it("Should answer 200 if send correct url as logged user", async () => {
    const response = await request(app)
      .delete("/media")
      .send({
        url: "https://s3.eu-west-1.amazonaws.com/media.bucket/media/T1/image_123456789.png",
      })
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
  });
});

describe("Route DELETE /media - media already linked", () => {
  beforeAll(async () => {
    await bugMedia.insert({
      location:
        "https://s3.eu-west-1.amazonaws.com/media.bucket/media/T1/image_123456789.png",
    });
  });
  afterAll(async () => {});
  it("Should answer 403 if trying to delete linked media", async () => {
    const response = await request(app)
      .delete("/media")
      .send({
        url: "https://s3.eu-west-1.amazonaws.com/media.bucket/media/T1/image_123456789.png",
      })
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(403);
  });
});
