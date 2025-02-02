/**  OPENAPI-CLASS : get-users-me-pending-booty */
import debugMessage from "@src/features/debugMessage";
import UserRoute from "@src/features/routes/UserRoute";
import * as db from "@src/features/db";

export default class RouteItem extends UserRoute<{
  response: StoplightOperations["get-users-me-pending-booty"]["responses"]["200"]["content"]["application/json"];
  query: StoplightOperations["get-users-me-pending-booty"]["parameters"]["query"];
}> {
  private start: number = 0;
  private limit: number = 25;
  private explicitLimitIsRequested: boolean = false;
  private order: "ASC" | "DESC" = "DESC";
  private orderBy: ReturnType<RouteItem["getQuery"]>["orderBy"] =
    "attributionDate";

  constructor(configuration: RouteClassConfiguration) {
    super({ ...configuration, element: "pending booty" });
    const query = this.getQuery();
    if (query.start) this.start = parseInt(query.start as unknown as string);
    if (query.limit) {
      this.limit = parseInt(query.limit as unknown as string);
      this.explicitLimitIsRequested = true;
    }
    if (query.order) this.order = query.order;
    if (query.orderBy) this.orderBy = query.orderBy;
  }

  protected async prepare() {
    try {
      const { results, total } = await this.getPendingBooties();
      this.setSuccess(200, {
        results: results.map((row) => {
          return {
            id: row.id,
            name: row.activityName,
            amount: {
              value: row.amount,
              currency: "EUR",
            },
            attributionDate: row.attributionDate.substring(0, 10),
          };
        }),
        limit: this.limit,
        size: results.length,
        start: this.start,
        total,
      });
    } catch (err) {
      debugMessage(err);
      this.setError(
        (err as OpenapiError).status_code || 400,
        err as OpenapiError
      );
    }
  }

  private async getPendingBooties() {
    const WHERE = `WHERE 
    p.tester_id = ? and p.is_paid=0 and p.is_requested=0`;
    const data = [this.getTesterId()];

    const sql = `
    SELECT 
        p.id as id, p.amount as amount, 
        CAST(p.creation_date as CHAR) as attributionDate, 
        CONCAT('[CP-', cp.id, '] ', cp.title) as activityName
    FROM wp_appq_payment p
    JOIN wp_appq_evd_campaign cp ON p.campaign_id = cp.id 
    ${WHERE} 
    ORDER BY ${this.orderBy} 
    ${this.order}, attributionDate ${this.order}
    LIMIT ${this.limit} OFFSET ${this.start}
`;
    const results: {
      id: number;
      name: string;
      amount: number;
      attributionDate: string;
      activityName: string;
    }[] = await db.query(db.format(sql, data));

    if (!results.length) {
      throw {
        status_code: 404,
        message: "No booty until now",
      };
    }
    let total: number | undefined = undefined;
    if (this.explicitLimitIsRequested) {
      const countSql = `SELECT COUNT(p.id) as total
    FROM wp_appq_payment p 
      ${WHERE}`;
      const countResults = await db.query(db.format(countSql, data));
      total = countResults[0].total;
    }
    return { results, total };
  }
}
