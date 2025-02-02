import Database from "./Database";

type PreselectionFormDataType = {
  id: number;
  campaign_id: number;
  tester_id: number;
  field_id: number;
  value: string;
};

class PreselectionFormDataObject {
  id: number;
  campaign_id: number;
  field_id: number;
  value: string;
  tester_id: number;

  constructor(item: PreselectionFormDataType) {
    this.id = item.id;
    this.campaign_id = item.campaign_id;
    this.tester_id = item.tester_id;
    this.field_id = item.field_id;
    this.value = item.value;
  }
}

class PreselectionFormData extends Database<{
  fields: PreselectionFormDataType;
}> {
  constructor(fields?: PreselectionFormData["fields"][number][] | ["*"]) {
    super({
      table: "wp_appq_campaign_preselection_form_data",
      primaryKey: "id",
      fields: fields
        ? fields
        : ["id", "campaign_id", "field_id", "value", "tester_id"],
    });
  }

  public createObject(
    row: PreselectionFormDataType
  ): PreselectionFormDataObject {
    return new PreselectionFormDataObject(row);
  }
}
export default PreselectionFormData;
export { PreselectionFormDataObject };
