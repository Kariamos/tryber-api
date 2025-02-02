import app from "@src/app";
import sqlite3 from "@src/features/sqlite";
import { data as bugData } from "@src/__mocks__/mockedDb/bug";
import { data as certificationListData } from "@src/__mocks__/mockedDb/certificationList";
import CustomUserFields from "@src/__mocks__/mockedDb/customUserFields";
import CustomUserFieldsData from "@src/__mocks__/mockedDb/customUserFieldsData";
import CustomUserFieldsExtras from "@src/__mocks__/mockedDb/customUserFieldsExtra";
import { data as educationListData } from "@src/__mocks__/mockedDb/educationList";
import { data as employmentListData } from "@src/__mocks__/mockedDb/employmentList";
import { data as languageListData } from "@src/__mocks__/mockedDb/languageList";
import Profile from "@src/__mocks__/mockedDb/profile";
import { data as testerCertificationData } from "@src/__mocks__/mockedDb/testerCertification";
import { data as testerLanguageData } from "@src/__mocks__/mockedDb/testerLanguage";
import WpOptions from "@src/__mocks__/mockedDb/wp_options";
import WpUsers from "@src/__mocks__/mockedDb/wp_users";
import request from "supertest";

const tester1 = {
  id: 1,
  name: "John",
  surname: "Doe",
  email: "jhon.doe@example.com",
  wp_user_id: 1,
  is_verified: 0,
};
const wpTester1 = {
  ID: 1,
  user_login: "john_doe",
};
const testerFull = {
  id: 1,
  name: "Bob",
  surname: "Alice",
  email: "bob.alice@example.com",
  wp_user_id: 1,
  is_verified: 1,
  booty: 69,
  pending_booty: 10,
  total_exp_pts: 6969,
  birth_date: "1996-03-21 00:00:00",
  phone_number: "+39696969696969",
  sex: 1,
  country: "Italy",
  city: "Rome",
  onboarding_complete: 1,
  employment_id: 1,
  education_id: 1,
};
const bug1 = {
  id: 1,
  wp_user_id: testerFull.wp_user_id,
  status_id: 2,
};
const testerCandidacy = {
  user_id: testerFull.wp_user_id,
  accepted: 1,
  results: 2,
};
const certification1 = {
  id: 1,
  name: "Best Tryber Ever",
  area: "Testing 360",
  institute: "Tryber",
};
const testerFullCertification1 = {
  id: 1,
  tester_id: testerFull.id,
  cert_id: certification1.id,
  achievement_date: new Date("01/01/2021").toISOString(),
};
const employment1 = {
  id: 1,
  display_name: "UNGUESS Tester",
};
const education1 = {
  id: 1,
  display_name: "Phd",
};
const lang1 = {
  id: 1,
  display_name: "Italian",
};
const testerFullLang1 = {
  id: 1,
  profile_id: testerFull.id,
  language_id: lang1.id,
};
const cufText = {
  //cuf
  id: 1,
  name: "Username Tetris",
  type: "text",
  enabled: 1,
};
const cufTextVal = {
  //cuf_data
  id: 1,
  value: "CiccioGamer89.",
  custom_user_field_id: 1,
  profile_id: testerFull.id,
  candidate: 0,
};
const cufSelect = {
  //cuf
  id: 2,
  name: "Tipologia di spezie preferita",
  type: "select",
  enabled: 1,
};
const cufSelectOption1 = {
  //cuf_exstras
  id: 1,
  name: "Habanero Scorpion",
};
const cufSelectTesterOption1 = {
  //cuf_data
  id: 2,
  value: cufSelectOption1.id,
  custom_user_field_id: cufSelect.id,
  profile_id: testerFull.id,
  candidate: 0,
};
const cufMultiselect = {
  //cuf
  id: 3,
  name: "Fornitore di cardamomo preferito",
  type: "multiselect",
  enabled: 1,
};
const cufMultiSelectVal1 = {
  //cuf_exstras
  id: 2,
  name: "Il cardamomo Siciliano",
};
const cufMultiSelectVal2 = {
  //cuf_exstras
  id: 3,
  name: "Treviso, città del Cardamomo",
};
const cufMultiSelectTesterVal1 = {
  //cuf_data
  id: 3,
  value: cufMultiSelectVal1.id,
  custom_user_field_id: cufMultiselect.id,
  profile_id: testerFull.id,
  candidate: 0,
};
const cufMultiSelectTesterVal2 = {
  //cuf_data
  id: 4,
  value: cufMultiSelectVal2.id,
  custom_user_field_id: cufMultiselect.id,
  profile_id: testerFull.id,
  candidate: 0,
};
const cufTextDisabled = {
  //cuf
  id: 4,
  name: "Fornitore di zenzero preferito",
  type: "multiselect",
  enabled: 0,
};

describe("Route GET users-me", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      await sqlite3.insert("wp_appq_evd_profile", tester1);
      await sqlite3.insert("wp_users", wpTester1);
      resolve(null);
    });
  });
  afterAll(async () => {
    return new Promise(async (resolve) => {
      await Profile.clear();
      await WpUsers.clear();

      resolve(null);
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/users/me");
    expect(response.status).toBe(403);
  });
  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer admin");
    expect(response.status).toBe(200);
  });
  it("Should return at least tryber id and tryber role", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: tester1.id, role: "tester" });
  });
  it("Should return an object with role 'tester' if the user is without special permission", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("role");
    expect(response.body.role).toBe("tester");
  });
  it("Should return at least tryber id and tryber role if fields parameter is an unccepted field", async () => {
    const response = await request(app)
      .get("/users/me?fields=aaaaaaaaaaaa,aaaaaaaaa")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: tester1.id, role: "tester" });
  });
});

describe("Route GET users-me-full-fields", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      WpOptions.crowdWpOptions();
      await sqlite3.insert("wp_appq_evd_profile", testerFull);
      await sqlite3.insert("wp_users", wpTester1);
      await sqlite3.insert("wp_appq_evd_bug", bug1);
      await sqlite3.insert("wp_crowd_appq_has_candidate", testerCandidacy);
      await sqlite3.insert("wp_appq_certifications_list", certification1);
      await sqlite3.insert(
        "wp_appq_profile_certifications",
        testerFullCertification1
      );
      await sqlite3.insert("wp_appq_employment", employment1);
      await sqlite3.insert("wp_appq_education", education1);
      await sqlite3.insert("wp_appq_lang", lang1);
      await sqlite3.insert("wp_appq_profile_has_lang", testerFullLang1);
      //insert cuf_text
      await sqlite3.insert("wp_appq_custom_user_field", cufText);
      await sqlite3.insert("wp_appq_custom_user_field_data", cufTextVal);
      //insert cuf_select
      await sqlite3.insert("wp_appq_custom_user_field", cufSelect);
      await sqlite3.insert(
        "wp_appq_custom_user_field_extras",
        cufSelectOption1
      );
      await sqlite3.insert(
        "wp_appq_custom_user_field_data",
        cufSelectTesterOption1
      );
      //insert cuf_multiselect
      await sqlite3.insert("wp_appq_custom_user_field", cufMultiselect);
      await sqlite3.insert(
        "wp_appq_custom_user_field_extras",
        cufMultiSelectVal1
      );
      await sqlite3.insert(
        "wp_appq_custom_user_field_extras",
        cufMultiSelectVal2
      );
      await sqlite3.insert(
        "wp_appq_custom_user_field_data",
        cufMultiSelectTesterVal1
      );
      await sqlite3.insert(
        "wp_appq_custom_user_field_data",
        cufMultiSelectTesterVal2
      );

      resolve(null);
    });
  });
  afterAll(async () => {
    return new Promise(async (resolve) => {
      await Profile.clear();
      await WpUsers.clear();

      await bugData.drop();
      await certificationListData.drop();
      await testerCertificationData.drop();
      await testerCertificationData.drop();
      await employmentListData.drop();
      await educationListData.drop();
      await languageListData.drop();
      await testerLanguageData.drop();
      await CustomUserFields.clear();
      await CustomUserFieldsData.clear();
      await CustomUserFieldsExtras.clear();
      await WpOptions.clear();

      resolve(null);
    });
  });

  it("Should return tryber (id, role and name) if parameter fields=name", async () => {
    const response = await request(app)
      .get("/users/me?fields=name")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toMatchObject({
      id: testerFull.id,
      role: "tester",
      name: testerFull.name,
    });
  });
  it("Should return tryber (id, role and gender) if parameter fields=gender", async () => {
    const response = await request(app)
      .get("/users/me?fields=gender")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("gender");
    expect(response.body).toMatchObject({
      id: testerFull.id,
      role: "tester",
      gender: "male",
    });
  });

  it("Should return certifications if parameter fields=certifications", async () => {
    const response = await request(app)
      .get("/users/me?fields=certifications")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("certifications");
    expect(response.body).toHaveProperty("role");
    expect(response.body.certifications[0]).toMatchObject({
      id: certification1.id,
      name: certification1.name,
      area: certification1.area,
      institute: certification1.institute,
      achievement_date: testerFullCertification1.achievement_date.substring(
        0,
        10
      ),
    });
    expect(Array.isArray(response.body.certifications)).toBe(true);
    const certs = response.body
      .certifications as StoplightOperations["get-users-me"]["responses"]["200"]["content"]["application/json"]["certifications"];
    if (Array.isArray(certs)) {
      certs.forEach((c) => {
        expect(c).toHaveProperty("id");
        expect(c).toHaveProperty("name");
        expect(c).toHaveProperty("area");
        expect(c).toHaveProperty("institute");
        expect(c).toHaveProperty("achievement_date");
      });
    }
  });
  it("Should return languages if parameter fields=languages", async () => {
    const response = await request(app)
      .get("/users/me?fields=languages")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("languages");
    expect(response.body).toHaveProperty("role");
    expect(response.body.languages[0]).toMatchObject({
      id: lang1.id,
      name: lang1.display_name,
    });
    expect(Array.isArray(response.body.languages)).toBe(true);
    const langs = response.body
      .languages as StoplightOperations["get-users-me"]["responses"]["200"]["content"]["application/json"]["languages"];
    if (Array.isArray(langs)) {
      langs.forEach((l) => {
        expect(l).toHaveProperty("id");
        expect(l).toHaveProperty("name");
      });
    }
  });
  it("Should return additionals if parameter fields=additional", async () => {
    const response = await request(app)
      .get("/users/me?fields=additional")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("additional");
    expect(response.body).toHaveProperty("role");
    expect(response.body.additional[3]).toMatchObject({
      field_id: cufText.id,
      name: cufText.name,
      text: cufTextVal.value,
    });
    expect(Array.isArray(response.body.additional)).toBe(true);
    const cufs = response.body
      .additional as StoplightOperations["get-users-me"]["responses"]["200"]["content"]["application/json"]["additional"];
    if (Array.isArray(cufs)) {
      cufs.forEach((c) => {
        expect(c).toHaveProperty("field_id");
        expect(c).toHaveProperty("name");
        expect(c).toHaveProperty("value");
      });
    }
  });

  it("should return only tester id, role, name and surname if the parameter fields=name,surname", async () => {
    const response = await request(app)
      .get("/users/me?fields=name,surname")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("surname");
    expect(response.body).toHaveProperty("role");
  });
  it("should return only tester id and role and accepted fields if the fields parameter has multiple options fields=name,home,email", async () => {
    const response = await request(app)
      .get("/users/me?fields=name,home,email")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("role");
  });
});
