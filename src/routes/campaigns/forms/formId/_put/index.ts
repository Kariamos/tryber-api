/** OPENAPI-CLASS: put-campaigns-forms-formId */
import UserRoute from "@src/features/routes/UserRoute";
import FieldCreator from "../../FieldCreator";
import Campaigns from "@src/features/db/class/Campaigns";
import PreselectionForms from "@src/features/db/class/PreselectionForms";
import PreselectionFormFields from "@src/features/db/class/PreselectionFormFields";

export default class RouteItem extends UserRoute<{
  response: StoplightOperations["put-campaigns-forms-formId"]["responses"]["200"]["content"]["application/json"];
  body: StoplightOperations["put-campaigns-forms-formId"]["requestBody"]["content"]["application/json"];
  parameters: StoplightOperations["put-campaigns-forms-formId"]["parameters"]["path"];
}> {
  private campaignId: number | undefined;
  private db: {
    forms: PreselectionForms;
    campaigns: Campaigns;
    fields: PreselectionFormFields;
  };

  constructor(options: RouteItem["configuration"]) {
    super(options);
    this.db = {
      forms: new PreselectionForms(),
      campaigns: new Campaigns(),
      fields: new PreselectionFormFields(),
    };
  }

  protected async init() {
    const { formId } = this.getParameters();
    this.setId(parseInt(formId));

    if ((await this.formExists()) === false) {
      this.setError(
        404,
        new Error(`Form ${this.getId()} doesn't exist`) as OpenapiError
      );
      throw new Error("Form doesn't exist");
    }

    const { campaign_id } = await this.db.forms.get(this.getId());
    this.campaignId = campaign_id ? campaign_id : undefined;
  }

  private async formExists() {
    return this.db.forms.exists(this.getId());
  }

  protected async filter() {
    if ((await super.filter()) === false) return false;

    if (this.hasCapability("manage_preselection_forms") === false) {
      return this.setUnauthorizedError();
    }
    if (this.campaignId && !this.hasAccessToCampaign(this.campaignId)) {
      return this.setUnauthorizedError();
    }
    return true;
  }

  private setUnauthorizedError() {
    this.setError(
      403,
      new Error(`You are not authorized to do this`) as OpenapiError
    );
    return false;
  }

  protected async prepare() {
    try {
      await this.editForm();
      await this.editFields();
      const form = await this.getForm();
      this.setSuccess(200, {
        ...form,
        id: this.getId(),
        fields: [],
      });
    } catch (e) {
      const error = e as OpenapiError;
      this.setError(error.status_code || 500, error);
    }
  }

  private async editForm() {
    const { name, campaign } = this.getBody();
    await this.db.forms.update({
      data: {
        name,
        author: this.getTesterId(),
        campaign_id: campaign
          ? await this.getValidCampaignId(campaign)
          : undefined,
      },
      where: [{ id: this.getId() }],
    });
  }

  private async editFields() {
    const { fields } = this.getBody();
    await this.clearFields();
    let i = 1;
    for (const field of fields) {
      const fieldCreator = new FieldCreator({
        ...field,
        formId: this.getId(),
        priority: i++,
      });
      await fieldCreator.create();
    }
  }

  private async clearFields() {
    await this.db.fields.delete([{ form_id: this.getId() }]);
  }

  private async getForm() {
    const form = await this.db.forms.get(this.getId());
    const campaign = form.campaign_id
      ? await this.db.campaigns.get(form.campaign_id)
      : undefined;
    return {
      name: form.name,
      fields: [],
      campaign: campaign
        ? {
            id: campaign.id,
            name: campaign.title,
          }
        : undefined,
    };
  }

  private async getValidCampaignId(campaign_id: number): Promise<number> {
    const formWithCurrentCampaignId = await this.db.forms.query({
      where: [{ campaign_id: campaign_id }],
    });
    if (formWithCurrentCampaignId.length !== 0) {
      throw {
        status_code: 406,
        message: "A form is already assigned to this campaign_id",
      };
    }
    return campaign_id;
  }
}
