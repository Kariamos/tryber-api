/** OPENAPI-CLASS: patch-campaigns-campaign-prospect */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import { tryber } from "@src/features/database";
import GetProspectRoute from "@src/routes/campaigns/campaignId/prospect/_get";
import OpenapiError from "@src/features/OpenapiError";
export default class ProspectRoute extends CampaignRoute<{
  response: StoplightOperations["patch-campaigns-campaign-prospect"]["responses"]["200"];
  parameters: StoplightOperations["patch-campaigns-campaign-prospect"]["parameters"]["path"];
  body: StoplightOperations["patch-campaigns-campaign-prospect"]["requestBody"]["content"]["application/json"];
}> {
  private COMPLETION_WORKTYPE = 1;
  private REFUND_WORKTYPE = 3;
  private worktypes: Record<number, string> = {};
  private COMPLETION_ACTIVITY_ID = 1;
  private campaignTitle: string = "";

  private prospectData:
    | StoplightOperations["get-campaigns-campaign-prospect"]["responses"]["200"]["content"]["application/json"]
    | undefined;

  protected async init(): Promise<void> {
    await super.init();
    const getProspectRoute = new GetProspectRoute(this.configuration);
    try {
      const prospectData = await getProspectRoute.getResolvedData();
      if (prospectData && "items" in prospectData) {
        this.prospectData = prospectData;
      }
    } catch {}
    this.worktypes = await this.getWorktypes();
    this.campaignTitle = await this.getCampaignTitle();
  }

  get prospect() {
    if (typeof this.prospectData === "undefined")
      throw new Error("Invalid prospect data");
    return this.prospectData;
  }

  get assignmentDate() {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  private async getWorktypes() {
    const worktypes = await tryber.tables.WpAppqPaymentWorkTypes.do().select();
    if (!worktypes.length) {
      return {
        1: "Tryber Test",
        3: "Refund Tryber Test",
      };
    }
    return worktypes.reduce(
      (obj, item) => ({ ...obj, [item.id]: item.work_type }),
      {}
    );
  }

  private async getCampaignTitle() {
    const cp_title = await tryber.tables.WpAppqEvdCampaign.do()
      .select(
        tryber.ref("title").withSchema("wp_appq_evd_campaign").as("title")
      )
      .where({ id: this.cp_id })
      .first();
    return cp_title?.title || "";
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;
    if (
      !this.hasAccessTesterSelection(this.cp_id) ||
      !this.hasAccessToProspect(this.cp_id)
    ) {
      this.setError(403, new OpenapiError("Access denied"));

      return false;
    }
    if (await this.thereIsAnExpAttribution()) {
      this.setError(304, new OpenapiError("Prospect delivery already started"));
      return false;
    }
    return true;
  }

  private async thereIsAnExpAttribution() {
    const payoutsModified = await tryber.tables.WpAppqExpPoints.do()
      .select("id")
      .where({ campaign_id: this.cp_id })
      .whereLike("reason", "%Campaign successfully completed%");
    return payoutsModified.length > 0;
  }

  protected async prepare(): Promise<void> {
    // await this.checkPerfect(); // se tutti i bug del t sono approvati mette il bonus perfect
    //take all bugs at least one bugs approved and no one bug refused or need review and set the bonus perfect exp from cpmeta

    //2testers, 1 bug, 1 approved, - 1 bug 1 refused e 1 approved
    //terzo tester 1 bug approved e 1 need review

    await this.assignExpAttributions();
    await this.assignBooties();
    // this.sendMail(); // to advise the tester that recived booties
    return this.setSuccess(200, {});
  }

  protected async assignExpAttributions() {
    const prospect_data = this.prospect;
    const exp_data = [];

    for (const prospect of prospect_data.items) {
      const {
        tester: { id: tester_id },
        experience: { completion: amount },
      } = prospect;
      const status =
        prospect.experience.completion > 0 ? "successfully" : "unsuccessfully"; //isComplete
      exp_data.push({
        tester_id,
        campaign_id: this.cp_id,
        activity_id: this.COMPLETION_ACTIVITY_ID,
        reason: `[CP${this.cp_id}] ${this.campaignTitle} - Campaign ${status} completed`,
        creation_date: this.assignmentDate,
        pm_id: this.getTesterId(),
        amount: prospect.experience.completion + prospect.experience.extra,
        bug_id: -1,
      });
    }
    await tryber.tables.WpAppqExpPoints.do().insert(exp_data);
  }

  protected async assignBooties() {
    const prospect_data = this.prospect;
    const booty_data = [];

    for (const prospect of prospect_data.items) {
      const {
        tester: { id: tester_id },
        payout: { completion, bug, refund, extra },
      } = prospect;
      const amount = completion + bug + extra;
      if (amount > 0) {
        const work_type = this.worktypes[this.COMPLETION_WORKTYPE];
        const note = `[CP${this.cp_id}] ${this.campaignTitle}`;
        booty_data.push({
          tester_id,
          campaign_id: this.cp_id,
          amount,
          note,
          created_by: this.getTesterId(),
          work_type,
          work_type_id: this.COMPLETION_WORKTYPE,
          creation_date: this.assignmentDate,
          is_paid: 0,
          receipt_id: -1,
          is_requested: 0,
          request_id: 0,
        });
      }
      console.log(prospect);
      if (refund > 0) {
        const work_type = this.worktypes[this.REFUND_WORKTYPE];
        const note = `[CP${this.cp_id}] ${this.campaignTitle} - Refund`;
        booty_data.push({
          tester_id,
          campaign_id: this.cp_id,
          amount: refund,
          note,
          created_by: this.getTesterId(),
          work_type_id: this.REFUND_WORKTYPE,
          work_type,
          creation_date: this.assignmentDate,
          is_paid: 0,
          receipt_id: -1,
          is_requested: 0,
          request_id: 0,
        });
      }
    }
    await tryber.tables.WpAppqPayment.do().insert(booty_data);
  }
}
