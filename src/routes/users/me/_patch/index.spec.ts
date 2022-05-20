import { data as attributions } from "@src/__mocks__/mockedDb/attributions";
import { data as bugs } from "@src/__mocks__/mockedDb/bug";
import { data as certificationsList } from "@src/__mocks__/mockedDb/certificationList";
import { data as campaignsCandidatures } from "@src/__mocks__/mockedDb/cp_has_candidates";
import { data as cuf } from "@src/__mocks__/mockedDb/customUserFields";
import { data as cufData } from "@src/__mocks__/mockedDb/customUserFieldsData";
import { data as cufExtras } from "@src/__mocks__/mockedDb/customUserFieldsExtra";
import { data as educationsList } from "@src/__mocks__/mockedDb/educationList";
import { data as employmentsList } from "@src/__mocks__/mockedDb/employmentList";
import { data as languagesList } from "@src/__mocks__/mockedDb/languageList";
import { data as profileData } from "@src/__mocks__/mockedDb/profile";
import { data as testerCertifications } from "@src/__mocks__/mockedDb/testerCertification";
import { data as testerLanguages } from "@src/__mocks__/mockedDb/testerLanguage";
import { data as wpOptions } from "@src/__mocks__/mockedDb/wp_options";
import { data as wpUsers } from "@src/__mocks__/mockedDb/wp_users";
import app from "@src/app";
import sqlite3 from "@src/features/sqlite";
import request from "supertest";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");
jest.mock("@src/routes/users/me/_get/getRankData");

const certification1 = {
  id: 1,
  name: "Best Tryber Ever",
  area: "Testing 360",
  institute: "Tryber",
};
const testerFullCertification1 = {
  id: 1,
  tester_id: 1,
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
  profile_id: 1,
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
  profile_id: 1,
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
  profile_id: 1,
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
  profile_id: 1,
  candidate: 0,
};
const cufMultiSelectTesterVal2 = {
  //cuf_data
  id: 4,
  value: cufMultiSelectVal2.id,
  custom_user_field_id: cufMultiselect.id,
  profile_id: 1,
  candidate: 0,
};
const testerPatchMail = {
  email: "bob.alice@example.com",
};

describe("Route PATCH users-me", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      await wpUsers.basicUser({
        user_login: "bob_alice",
        user_email: "bob.alice@example.com",
      });
      await attributions.validAttribution();
      await wpOptions.crowdWpOptions();
      await profileData.basicTester({
        booty: 69,
        birth_date: "1996-03-21 00:00:00",
        phone_number: "+39696969696969",
        sex: 1,
        country: "Italy",
        city: "Rome",
        onboarding_complete: 1,
        employment_id: 1,
        education_id: 1,
      });
      await bugs.basicBug({ status_id: 2 });
      await campaignsCandidatures.candidate1({ accepted: 1, results: 2 });
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
      await wpUsers.drop();
      await attributions.drop();
      await wpOptions.drop();
      await profileData.drop();
      await bugs.drop();
      await campaignsCandidatures.drop();
      await certificationsList.drop();
      await testerCertifications.drop();
      await employmentsList.drop();
      await educationsList.drop();
      await languagesList.drop();
      await testerLanguages.drop();
      await cuf.drop();
      await cufData.drop();
      await cufExtras.drop();
      resolve(null);
    });
  });
  it("Should not update user when no parameters were given", async () => {
    const responseGetBeforePatch = await request(app)
      .get(`/users/me?fields=all`)
      .set("Authorization", `Bearer tester`);
    expect(responseGetBeforePatch.status).toBe(200);

    const responsePatch = await request(app)
      .patch(`/users/me`)
      .set("Authorization", `Bearer tester`);
    expect(responsePatch.status).toBe(200);

    const responseGetAfterPatch = await request(app)
      .get(`/users/me?fields=all`)
      .set("Authorization", `Bearer tester`);
    expect(responseGetAfterPatch.status).toBe(200);
    expect(responseGetAfterPatch.body).toMatchObject(
      responseGetBeforePatch.body
    );
  });
});

describe("Route PATCH users-me new mail", () => {
  beforeEach(async () => {
    return new Promise(async (resolve) => {
      await attributions.validAttribution();

      await wpUsers.basicUser({
        user_login: "bob_alice",
        user_email: "bob.alice@example.com",
      });
      await wpUsers.basicUser({
        ID: 2,
        user_login: "bob",
        user_email: "bob@example.com",
      });
      wpOptions.crowdWpOptions();
      await profileData.basicTester({
        booty: 69,
        birth_date: "1996-03-21 00:00:00",
        phone_number: "+39696969696969",
        sex: 1,
        country: "Italy",
        city: "Rome",
        onboarding_complete: 1,
        employment_id: 1,
        education_id: 1,
        is_verified: 1,
      });
      await bugs.basicBug({ status_id: 2 });
      await campaignsCandidatures.candidate1({ accepted: 1, results: 2 });
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
  afterEach(async () => {
    return new Promise(async (resolve) => {
      await wpUsers.drop();
      await attributions.drop();
      await wpOptions.drop();
      await profileData.drop();
      await bugs.drop();
      await campaignsCandidatures.drop();
      await certificationsList.drop();
      await testerCertifications.drop();
      await employmentsList.drop();
      await educationsList.drop();
      await languagesList.drop();
      await testerLanguages.drop();
      await cuf.drop();
      await cufData.drop();
      await cufExtras.drop();
      resolve(null);
    });
  });
  it("Should return 412 if email already exists", async () => {
    const response = await request(app)
      .patch(`/users/me`)
      .set("Authorization", `Bearer tester`)
      .send({ email: "bob@example.com" });
    expect(response.status).toBe(412);
  });
  it("Should return tryber with new mail if send a new mail ", async () => {
    const responseGet1 = await request(app)
      .get(`/users/me`)
      .set("Authorization", `Bearer tester`);
    expect(responseGet1.status).toBe(200);
    expect(responseGet1.body.email).toBe("tester@example.com");
    expect(responseGet1.body.is_verified).toBe(true);

    const responsePatch = await request(app)
      .patch(`/users/me`)
      .set("Authorization", `Bearer tester`)
      .send({ email: "pino@example.com" });

    const responseGet2 = await request(app)
      .get(`/users/me?fields=email,is_verified`)
      .set("Authorization", `Bearer tester`);
    expect(responseGet2.status).toBe(200);
    expect(responseGet2.body.email).toBe("pino@example.com");
    expect(responseGet2.body.is_verified).toBe(false);
    const wpTesterEmail = await sqlite3.get(
      "SELECT user_email FROM wp_users WHERE ID=1"
    );
    expect(responsePatch.body.email).toBe(wpTesterEmail.user_email);
  });
});
