import Replicabilities from "@src/__mocks__/mockedDb/bugReplicabilities";
import Severities from "@src/__mocks__/mockedDb/bugSeverities";
import BugTypes from "@src/__mocks__/mockedDb/bugTypes";
import Campaigns from "@src/__mocks__/mockedDb/campaign";
import CampaignAdditionals from "@src/__mocks__/mockedDb/campaignAdditionals";
import CampaignMeta from "@src/__mocks__/mockedDb/campaignMeta";
import Candidature from "@src/__mocks__/mockedDb/cpHasCandidates";
import CustomBugTypes from "@src/__mocks__/mockedDb/customBugTypes";
import CustomReplicabilities from "@src/__mocks__/mockedDb/customReplicabilities";
import CustomSeverities from "@src/__mocks__/mockedDb/customSeverities";
import Profile from "@src/__mocks__/mockedDb/profile";
import UseCases from "@src/__mocks__/mockedDb/usecases";
import UseCaseGroups from "@src/__mocks__/mockedDb/usecasesGroups";
import WpOptions from "@src/__mocks__/mockedDb/wp_options";
import WpUsers from "@src/__mocks__/mockedDb/wp_users";
import app from "@src/app";
import request from "supertest";

beforeAll(async () => {
  await Profile.insert();
  await WpUsers.insert();
  await Candidature.insert({
    campaign_id: 1,
    user_id: 1,
    group_id: 1,
    accepted: 1,
  });
  await Severities.insert({ id: 1, name: "Low" });
  await Severities.insert({ id: 2, name: "Medium" });
  await BugTypes.insert({ id: 1, name: "Typo" });
  await BugTypes.insert({ id: 2, name: "Crash" });
  await BugTypes.insert({ id: 3, name: "Atomic", is_enabled: 0 });
  await Replicabilities.insert({ id: 1, name: "Once" });
  await Replicabilities.insert({ id: 2, name: "Always" });

  await UseCases.insert({
    id: 2,
    title: "First Usecase All groups",
    group_id: 0,
    position: 1,
    campaign_id: 1,
  });
  await UseCases.insert({
    id: 1,
    title: "Second Usecase All groups",
    group_id: 0,
    position: 2,
    campaign_id: 1,
  });
  await UseCases.insert({
    id: 3,
    title: "Third Usecase All groups",
    group_id: 0,
    position: 2,
    campaign_id: 1,
  });
  await UseCases.insert({
    id: 4,
    title: "Fourth Usecase Group 1",
    group_id: 1,
    position: 4,
    campaign_id: 1,
  });
  await UseCases.insert({
    id: 5,
    title: "Fourth Usecase Group 2",
    group_id: 2,
    position: 4,
    campaign_id: 1,
  });
  await UseCases.insert({
    id: 6,
    title: "Usecase of another campaign",
    group_id: 0,
    position: 0,
    campaign_id: 2,
  });
  await UseCases.insert({
    id: 7,
    title: "Usecase multigroup",
    group_id: -1,
    position: 5,
    campaign_id: 1,
  });
  await UseCases.insert({
    id: 9,
    title: "Usecase multigroup without current user",
    group_id: -1,
    position: 5,
    campaign_id: 1,
  });
  await UseCases.insert({
    id: 8,
    title: "Usecase multigroup of another campaign",
    group_id: -1,
    position: 5,
    campaign_id: 2,
  });
  await UseCases.insert({
    id: 10,
    title: "Usecase multigroup all groups",
    group_id: -1,
    position: 10,
    campaign_id: 1,
  });
  await UseCaseGroups.insert({ task_id: 7, group_id: 1 });
  await UseCaseGroups.insert({ task_id: 7, group_id: 2 });
  await UseCaseGroups.insert({ task_id: 8, group_id: 1 });
  await UseCaseGroups.insert({ task_id: 8, group_id: 2 });
  await UseCaseGroups.insert({ task_id: 9, group_id: 2 });
  await UseCaseGroups.insert({ task_id: 9, group_id: 3 });
  await UseCaseGroups.insert({ task_id: 10, group_id: 0 });
  await Campaigns.insert({
    id: 1,
    title: "My campaign",
    min_allowed_media: 4,
    campaign_type: 0,
  });

  await WpOptions.insert({
    option_name: "options_appq_valid_upload_extensions",
    option_value: "jpg,png,gif",
  });
});
afterAll(async () => {
  await WpUsers.clear();
  await Profile.clear();
  await WpOptions.clear();
  await Candidature.clear();
  await Severities.clear();
  await Campaigns.clear();
  await BugTypes.clear();
  await Replicabilities.clear();
  await UseCases.clear();
  await WpOptions.clear();
  await UseCaseGroups.clear();
});
describe("Route GET /users/me/campaigns/{campaignId}/", () => {
  it("Should return 403 if user is not logged in", () => {
    return request(app).get("/users/me/campaigns/1").expect(403);
  });
  it("Should return 404 if user is logged in but not selected", () => {
    return request(app)
      .get("/users/me/campaigns/100")
      .set("Authorization", "Bearer tester")
      .expect(404);
  });
  it("Should return 200 if user is logged and selected", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1")
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(200);
  });
  it("Should return only active and accepted bugTypes if user is logged and selected", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1")
      .set("Authorization", "Bearer tester");
    expect(response.body).toHaveProperty("bugTypes");
    expect(response.body.bugTypes).toEqual({
      valid: ["TYPO", "CRASH"],
      invalid: [],
    });
  });
  it("Should return campaign data if user is logged and selected", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1")
      .set("Authorization", "Bearer tester");
    expect(response.body).toEqual({
      id: 1,
      title: "My campaign",
      minimumMedia: 4,
      hasBugForm: true,
      bugSeverity: { valid: ["LOW", "MEDIUM"], invalid: [] },
      bugTypes: { valid: ["TYPO", "CRASH"], invalid: [] },
      bugReplicability: { valid: ["ONCE", "ALWAYS"], invalid: [] },
      useCases: [
        {
          id: 2,
          name: "First Usecase All groups",
        },
        {
          id: 1,
          name: "Second Usecase All groups",
        },
        {
          id: 3,
          name: "Third Usecase All groups",
        },
        {
          id: 4,
          name: "Fourth Usecase Group 1",
        },
        {
          id: 7,
          name: "Usecase multigroup",
        },
        {
          id: 10,
          name: "Usecase multigroup all groups",
        },
        {
          id: -1,
          name: "Not a specific usecase",
        },
      ],
      validFileExtensions: [".jpg", ".png", ".gif"],
    });
  });
});

describe("Route GET /users/me/campaigns/{campaignId}/ - custom severities set", () => {
  beforeAll(async () => {
    await CustomSeverities.insert({ campaign_id: 1, bug_severity_id: 1 });
  });
  afterAll(async () => {
    await CustomSeverities.clear();
  });
  it("Should return only selected severities", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1")
      .set("Authorization", "Bearer tester");
    expect(response.body).toMatchObject({
      bugSeverity: { valid: ["LOW"], invalid: ["MEDIUM"] },
    });
  });
});

describe("Route GET /users/me/campaigns/{campaignId}/ - custom bug types set", () => {
  beforeAll(async () => {
    await CustomBugTypes.insert({ campaign_id: 1, bug_type_id: 1 });
  });
  afterAll(async () => {
    await CustomBugTypes.clear();
  });
  it("Should return only selected bug types", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1")
      .set("Authorization", "Bearer tester");
    expect(response.body).toMatchObject({
      bugTypes: { valid: ["TYPO"], invalid: ["CRASH"] },
    });
  });
});

describe("Route GET /users/me/campaigns/{campaignId}/ - custom replicabilities set", () => {
  beforeAll(async () => {
    await CustomReplicabilities.insert({
      campaign_id: 1,
      bug_replicability_id: 1,
    });
  });
  afterAll(async () => {
    await CustomReplicabilities.clear();
  });
  it("Should return only selected bug types", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1")
      .set("Authorization", "Bearer tester");
    expect(response.body).toMatchObject({
      bugReplicability: { valid: ["ONCE"], invalid: ["ALWAYS"] },
    });
  });
});

describe("Route GET /users/me/campaigns/{campaignId}/ - additional fields set", () => {
  beforeAll(async () => {
    await CampaignAdditionals.insert({
      id: 1,
      cp_id: 1,
      slug: "browser",
      title: "Browser",
      type: "select",
      validation: 'Chromé;Sa Fari\\"',
      error_message: "Please select the browser used",
    });
    await CampaignAdditionals.insert({
      id: 2,
      cp_id: 1,
      slug: "codice-cliente",
      title: "Codice Cliente",
      type: "regex",
      validation: '^[A-Z]{3}[0-9]{4}"\\$',
      error_message: "Inserisci un codice cliente valido (es. ABC1234)",
    });
    await CampaignAdditionals.insert({
      id: 3,
      cp_id: 2,
      slug: "altra-cp",
      title: "Altra CP",
      type: "regex",
      validation: "",
      error_message: "",
    });
  });
  afterAll(async () => {
    await CampaignAdditionals.clear();
  });
  it("Should return a list of additional fields", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1")
      .set("Authorization", "Bearer tester");
    expect(response.body).toMatchObject({
      additionalFields: [
        {
          type: "select",
          name: "Browser",
          slug: "browser",
          options: ["Chromé", 'Sa Fari\\"'],
          error: "Please select the browser used",
        },
        {
          type: "text",
          slug: "codice-cliente",
          name: "Codice Cliente",
          regex: '^[A-Z]{3}[0-9]{4}"\\$',
          error: "Inserisci un codice cliente valido (es. ABC1234)",
        },
      ],
    });
  });
});

describe("Route GET /users/me/campaigns/{campaignId}/ - bug language set", () => {
  beforeAll(async () => {
    await Campaigns.clear();

    await Campaigns.insert({
      id: 1,
      title: "My campaign",
      min_allowed_media: 4,
      campaign_type: 0,
      bug_lang: 1,
    });
    await CampaignMeta.insert({
      meta_id: 1,
      campaign_id: 5,
      meta_key: "bug_lang_code",
      meta_value: "en",
    });
    await CampaignMeta.insert({
      meta_id: 2,
      campaign_id: 5,
      meta_key: "bug_lang_message",
      meta_value: "Bug in english",
    });
    await CampaignMeta.insert({
      meta_id: 3,
      campaign_id: 1,
      meta_key: "bug_lang_code",
      meta_value: "it",
    });
    await CampaignMeta.insert({
      meta_id: 4,
      campaign_id: 1,
      meta_key: "bug_lang_message",
      meta_value: "Bug in italiano",
    });
  });
  afterAll(async () => {
    await CampaignMeta.clear();
  });
  it("Should return a the language with a message", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1")
      .set("Authorization", "Bearer tester");
    expect(response.body).toMatchObject({
      language: {
        code: "IT",
        message: "Bug in italiano",
      },
    });
  });
});

describe("Route GET /users/me/campaigns/{campaignId}/ - title rule set", () => {
  beforeAll(async () => {
    await CampaignMeta.insert({
      meta_id: 1,
      campaign_id: 1,
      meta_key: "bug_title_rule",
      meta_value: "1",
    });
  });
  afterAll(async () => {
    await CampaignMeta.clear();
  });
  it("Should return title rule = true", async () => {
    const response = await request(app)
      .get("/users/me/campaigns/1")
      .set("Authorization", "Bearer tester");
    expect(response.body).toMatchObject({
      titleRule: true,
    });
  });
});
