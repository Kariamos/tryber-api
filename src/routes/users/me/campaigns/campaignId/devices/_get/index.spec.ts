import app from "@src/app";
import request from "supertest";
import Campaigns from "@src/__mocks__/mockedDb/campaign";
import Profile from "@src/__mocks__/mockedDb/profile";
import Candidature from "@src/__mocks__/mockedDb/cpHasCandidates";
import TesterDevice from "@src/__mocks__/mockedDb/testerDevice";
import DevicePlatform from "@src/__mocks__/mockedDb/devicePlatform";
import DeviceOS from "@src/__mocks__/mockedDb/deviceOs";
import WpUsers from "@src/__mocks__/mockedDb/wp_users";

beforeAll(async () => {
  await Profile.insert();
  await WpUsers.insert();
  await Campaigns.insert({
    id: 1,
    title: "My campaign",
    min_allowed_media: 4,
    campaign_type: 0,
  });
  await Campaigns.insert({
    id: 10,
    title: "My campaign",
    min_allowed_media: 4,
    campaign_type: 0,
  });
  await DeviceOS.insert({
    id: 1,
    display_name: "Lollipop",
    version_number: "5.1.1",
  });
  await DevicePlatform.insert({
    id: 1,
    name: "Android",
  });

  await DeviceOS.insert({
    id: 2,
    display_name: "XP",
    version_number: "1.0",
  });
  await DevicePlatform.insert({
    id: 2,
    name: "Windows",
  });
});
afterAll(async () => {
  await WpUsers.clear();
  await Profile.clear();
  await TesterDevice.clear();
  await DeviceOS.clear();
});
describe("Route GET /users/me/campaign/{campaignId}/devices ", () => {
  beforeAll(async () => {
    await TesterDevice.insert({
      id: 1,
      id_profile: 1,
      platform_id: 1,
      os_version_id: 1,
      enabled: 1,
      form_factor: "Smartphone",
      manufacturer: "Google",
      model: "Pixel 3",
      source_id: 10,
    });
    await TesterDevice.insert({
      id: 2,
      id_profile: 1,
      platform_id: 2,
      os_version_id: 2,
      enabled: 1,
      form_factor: "PC",
      pc_type: "Desktop",
      manufacturer: "Acer",
      model: "Aspire",
      source_id: 15,
    });
    await Candidature.insert({
      campaign_id: 1,
      user_id: 1,
      group_id: 1,
      selected_device: 1,
      accepted: 1,
    });
  });
  afterAll(async () => {
    await Candidature.clear();
    await TesterDevice.clear();
  });
  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/users/me/campaigns/1/devices");
    expect(response.status).toBe(403);
  });
  it("Should answer 200 if logged in and everything is fine", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1/devices")
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(200);
  });
  it("Should answer 404 if logged in but not selected", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/10/devices")
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(404);
  });
  it("Should answer 404 if logged in but campaign does not exists", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/100/devices")
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(404);
  });
});

describe("Route GET /users/me/campaign/{campaignId}/devices - single device ", () => {
  beforeAll(async () => {
    await TesterDevice.insert({
      id: 1,
      id_profile: 1,
      platform_id: 1,
      os_version_id: 1,
      enabled: 1,
      form_factor: "Smartphone",
      manufacturer: "Google",
      model: "Pixel 3",
      source_id: 10,
    });
    await TesterDevice.insert({
      id: 2,
      id_profile: 1,
      platform_id: 2,
      os_version_id: 2,
      enabled: 1,
      form_factor: "PC",
      pc_type: "Desktop",
      manufacturer: "Acer",
      model: "Aspire",
      source_id: 15,
    });
    await Candidature.insert({
      campaign_id: 1,
      user_id: 1,
      group_id: 1,
      selected_device: 1,
      accepted: 1,
    });
  });
  afterAll(async () => {
    await Candidature.clear();
    await TesterDevice.clear();
  });
  it("Should answer 200 with device data", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1/devices/")
      .set("Authorization", "Bearer tester");
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toEqual({
      id: 1,
      type: "Smartphone",
      device: {
        id: 10,
        manufacturer: "Google",
        model: "Pixel 3",
      },
      operating_system: {
        id: 1,
        platform: "Android",
        version: "Lollipop (5.1.1)",
      },
    });
  });
});

describe("Route GET /users/me/campaign/{campaignId}/devices - all devices ", () => {
  beforeAll(async () => {
    await TesterDevice.insert({
      id: 1,
      id_profile: 1,
      platform_id: 1,
      os_version_id: 1,
      enabled: 1,
      form_factor: "Smartphone",
      manufacturer: "Google",
      model: "Pixel 3",
      source_id: 10,
    });
    await TesterDevice.insert({
      id: 2,
      id_profile: 1,
      platform_id: 2,
      os_version_id: 2,
      enabled: 1,
      form_factor: "PC",
      pc_type: "Desktop",
      manufacturer: "Acer",
      model: "Aspire",
      source_id: 15,
    });
    await Candidature.insert({
      campaign_id: 1,
      user_id: 1,
      group_id: 1,
      selected_device: 0,
      accepted: 1,
    });
  });
  afterAll(async () => {
    await Candidature.clear();
    await TesterDevice.clear();
  });
  it("Should answer 200 with device data", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1/devices/")
      .set("Authorization", "Bearer tester");
    expect(response.body.length).toBe(2);
    expect(response.body).toEqual([
      {
        id: 1,
        type: "Smartphone",
        device: {
          id: 10,
          manufacturer: "Google",
          model: "Pixel 3",
        },
        operating_system: {
          id: 1,
          platform: "Android",
          version: "Lollipop (5.1.1)",
        },
      },
      {
        id: 2,
        type: "PC",
        device: {
          pc_type: "Desktop",
        },
        operating_system: {
          id: 2,
          platform: "Windows",
          version: "XP (1.0)",
        },
      },
    ]);
  });
});

describe("Route GET /users/me/campaign/{campaignId}/devices - selected with all devices but have none", () => {
  beforeAll(async () => {
    await Candidature.insert({
      campaign_id: 1,
      user_id: 1,
      group_id: 1,
      selected_device: 0,
      accepted: 1,
    });
  });
  afterAll(async () => {
    await Candidature.clear();
  });
  it("Should answer 404 with device data", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1/devices/")
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(404);
  });
});

describe("Route GET /users/me/campaign/{campaignId}/devices - selected with a device but have none", () => {
  beforeAll(async () => {
    await Candidature.insert({
      campaign_id: 1,
      user_id: 1,
      group_id: 1,
      accepted: 1,
      selected_device: 100,
    });
  });
  afterAll(async () => {
    await Candidature.clear();
  });
  it("Should answer 404 with device data", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1/devices/")
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(404);
  });
});
