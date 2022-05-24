import sqlite3 from "@src/features/sqlite";
import { data as attributionData } from "@src/__mocks__/mockedDb/attributions";
import { data as paymentRequestData } from "@src/__mocks__/mockedDb/paymentRequest";
import { data as profileData } from "@src/__mocks__/mockedDb/profile";
import updatePayment from ".";

jest.mock("@src/features/db");

const tester = {
  id: 1,
  booty: 100,
  pending_booty: 100,
  name: "John",
  surname: "Doe",
  payment_status: 1,
};
const paymentWithError: Payment = {
  tester_id: tester.id,
  amount: 100,
  testerEmail: "john.doe@example.com",
  coordinates: "DE12345678901234567890",
  accountName: "John Doe",
  status: "pending",
  type: "transferwise",
  id: 1,
  error: {
    status_code: 400,
    name: "Bad Request",
    message: "Error message",
  },
};

const paymentWithFee: Payment = {
  tester_id: tester.id,
  amount: 100,
  testerEmail: "john.doe@example.com",
  coordinates: "DE12345678901234567890",
  accountName: "John Doe",
  status: "pending",
  type: "transferwise",
  id: 1,
  fee: 0.5,
};

const validBankTransferPayment = {
  id: 1,
  tester_id: 1,
  amount: 100,
  iban: "DE12345678901234567890",
  is_paid: 0,
};
describe("updatePayment", () => {
  beforeEach(() => {
    return new Promise(async (resolve, reject) => {
      try {
        await sqlite3.insert(
          "wp_appq_payment_request",
          validBankTransferPayment
        );
        await sqlite3.insert("wp_appq_evd_profile", tester);
        await sqlite3.insert("wp_appq_payment", {
          id: 1,
          is_paid: 0,
          request_id: 1,
        });
        await sqlite3.insert("wp_appq_payment", {
          id: 2,
          is_paid: 0,
          request_id: 1,
        });
        resolve(null);
      } catch (err) {
        reject(err);
      }
    });
  });
  afterEach(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await paymentRequestData.drop();
        await attributionData.drop();
        await profileData.drop();
        resolve(null);
      } catch (err) {
        reject(err);
      }
    });
  });
  it("Should update error when payment has error", async () => {
    await updatePayment(paymentWithError);
    const payment = await sqlite3.get(
      `SELECT error_message FROM wp_appq_payment_request WHERE id = ${paymentWithError.id} `
    );
    expect(payment.error_message).toBe(paymentWithError.error?.message);
  });
  it("Should update fee when payment has fee", async () => {
    await updatePayment(paymentWithFee);
    const payment = await sqlite3.get(
      `SELECT amount_paypal_fee FROM wp_appq_payment_request WHERE id = ${paymentWithFee.id} `
    );
    expect(payment.amount_paypal_fee).toBe(paymentWithFee.fee);
  });
  it("Should update paid status", async () => {
    await updatePayment(paymentWithFee);
    const paymentRequest = await sqlite3.get(
      `SELECT is_paid FROM wp_appq_payment_request WHERE id = ${paymentWithFee.id} `
    );
    expect(paymentRequest.is_paid).toBe(1);
    const paymentList = await sqlite3.all(
      `SELECT is_paid FROM wp_appq_payment WHERE request_id = ${paymentWithFee.id} `
    );
    expect(
      paymentList.every((payment: { is_paid: number }) => payment.is_paid === 1)
    ).toBe(true);

    const testerStatus = await sqlite3.get(
      `SELECT payment_status  FROM wp_appq_evd_profile WHERE id = ${paymentWithFee.tester_id} `
    );
    expect(testerStatus.payment_status).toBe(0);
  });
});
