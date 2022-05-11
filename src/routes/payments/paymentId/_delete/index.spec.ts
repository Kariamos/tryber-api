import {
  data as attributionsData,
  table as attributionsTable,
} from "@src/__mocks__/mockedDb/attributions";
import {
  data as paymentRequestData,
  table as paymentRequestTable,
} from "@src/__mocks__/mockedDb/paymentRequest";
import app from "@src/app";
import sqlite3 from "@src/features/sqlite";
import request from "supertest";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");
describe("DELETE /payments/{paymentId}", () => {
  beforeEach(async () => {
    return new Promise(async (resolve) => {
      await paymentRequestTable.create();
      await paymentRequestData.processingPaypalPayment({ id: 1, amount: 2 });
      await paymentRequestData.paidPaypalPayment({ id: 2 });
      await attributionsTable.create();
      await attributionsData.validAttribution({
        id: 1,
        request_id: 1,
        is_requested: 1,
      });
      await attributionsData.validAttribution({
        id: 2,
        request_id: 1,
        is_requested: 1,
      });
      resolve(null);
    });
  });
  afterEach(async () => {
    return new Promise(async (resolve) => {
      await paymentRequestTable.drop();
      await attributionsTable.drop();
      resolve(null);
    });
  });
  it("Should return 403 if user is not admin", async () => {
    const response = await request(app)
      .delete("/payments/1")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(403);
  });
  it("Should return 200 if user is admin and paymentId exist", async () => {
    const response = await request(app)
      .delete("/payments/1")
      .set("authorization", "Bearer admin");
    expect(response.status).toBe(200);
  });
  it("Should remove from database the payment_request if paymentId exists", async () => {
    const response = await request(app)
      .delete("/payments/1")
      .set("authorization", "Bearer admin");
    const resAfterDeletion = await sqlite3.get(
      `SELECT * FROM wp_appq_payment_request WHERE id = 1`
    );
    expect(resAfterDeletion).toBe(undefined);
  });
  it("Should return 403 if payment_request is already paid", async () => {
    const resBeforeDeletion = await sqlite3.all(
      `SELECT * FROM wp_appq_payment_request`
    );

    const response = await request(app)
      .delete("/payments/2") //2 is the id of the payment_request that is already paid
      .set("authorization", "Bearer admin");
    expect(response.status).toBe(403);

    const resAfterDeletion = await sqlite3.all(
      `SELECT * FROM wp_appq_payment_request`
    );
    expect(resAfterDeletion.length).toBe(resBeforeDeletion.length);
  });
  it("Should set the attribution of the payments as unrequested", async () => {
    const attributions = await sqlite3.all(`SELECT * FROM wp_appq_payment`);
    expect(attributions[0].is_requested).toBe(1);
    expect(attributions[1].is_requested).toBe(1);

    const response = await request(app)
      .delete("/payments/1")
      .set("authorization", "Bearer admin");

    const attributionsAfterDeletion = await sqlite3.all(
      `SELECT * FROM wp_appq_payment`
    );
    expect(attributionsAfterDeletion[0].is_requested).toBe(0);
    expect(attributionsAfterDeletion[1].is_requested).toBe(0);
  });
  it("Should return 404 if user is admin and paymentId does not exist", async () => {
    const response = await request(app)
      .delete("/payments/69")
      .set("authorization", "Bearer admin");
    expect(response.status).toBe(404);
  });
});