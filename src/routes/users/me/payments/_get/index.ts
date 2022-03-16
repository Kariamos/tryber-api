/**  OPENAPI-ROUTE : get-users-me-payments */
import * as db from "@src/features/db";
import debugMessage from "@src/features/debugMessage";
import { Context } from "openapi-backend";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  try {
    const query = `SELECT pr.*, rcpt.url AS receipt
    FROM wp_appq_payment_request pr
             LEFT JOIN wp_appq_receipt rcpt ON pr.receipt_id = rcpt.id
    WHERE pr.tester_id = ? AND 
    ( pr.iban IS NOT NULL AND pr.paypal_email IS NULL) OR 
    (pr.iban IS NULL AND pr.paypal_email IS NOT NULL)`;

    const results = await db.query(db.format(query, [req.user.testerId]));
    const c = {
      results: results.map((row: any) => {
        return {
          id: row.id,
          status: row.is_paid === 0 ? "processing" : "paid",
          amount: {
            value: row.amount,
            currency: "EUR",
          },
          paidDate: new Date(row.update_date).toISOString().substring(0, 10),
          method: {
            type: !row.paypal_email ? "iban" : "paypal",
            note: !row.paypal_email
              ? "Iban ************" +
                row.iban.substr(-Math.min(row.iban.length - 1, 6))
              : row.paypal_email,
          },
          receipt: row.receipt ? row.receipt : undefined,
        };
      }),
    };
    console.log(c);
    res.status_code = 200;

    return c;
  } catch (err) {
    debugMessage(err);
    res.status_code = 400;
    return {
      element: "payment-requests",
      id: 0,
      message: (err as OpenapiError).message,
    };
  }
};
