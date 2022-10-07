import Database from "./Database";
import PageAccess from "./PageAccess";

type CampaignType = {
  id: number;
  title: string;
  is_public: 0 | 1 | 2 | 3;
  page_preview_id: string;
  page_manual_id: string;
  status_id: 1 | 2;
  start_date: string;
  end_date: string;
  close_date: string;
  campaign_type_id: number;
  os: string;
};

class CampaignObject {
  id: number;
  title: string;
  is_public: 0 | 1 | 2 | 3;
  page_preview_id: string;
  page_manual_id: string;
  status_id: 1 | 2;
  start_date: string;
  end_date: string;
  close_date: string;
  campaign_type_id: number;
  os: string;

  constructor(item: CampaignType) {
    this.id = item.id;
    this.title = item.title;
    this.is_public = item.is_public;
    this.page_preview_id = item.page_preview_id;
    this.page_manual_id = item.page_manual_id;
    this.status_id = item.status_id;
    this.start_date = item.start_date;
    this.end_date = item.end_date;
    this.close_date = item.close_date;
    this.campaign_type_id = item.campaign_type_id;
    this.os = item.os;
  }

  get isPublic() {
    return this.is_public === 1;
  }
  get isSmallGroup() {
    return this.is_public === 3;
  }

  get acceptedOs() {
    if (!this.os || this.os === "") return [];
    return this.os.split(",").map((e) => parseInt(e));
  }

  public async testerHasAccess(testerId: number) {
    if (this.isPublic) return true;
    if (this.isSmallGroup) {
      const pageAccess = new PageAccess();
      const previewAccess = await pageAccess.query({
        where: [
          { tester_id: testerId },
          { view_id: parseInt(this.page_preview_id) },
        ],
      });
      return previewAccess.length > 0;
    }
    return false;
  }

  public async isApplicationAvailable() {
    const today = new Date().toISOString().split("T")[0];
    return new Date(this.start_date) >= new Date(today);
  }

  public isOsAccepted(os: number) {
    if (this.acceptedOs.length === 0) return true;
    return this.acceptedOs.includes(os);
  }
}

class Campaigns extends Database<{
  fields: CampaignType;
}> {
  constructor(fields?: Campaigns["fields"][number][] | ["*"]) {
    super({
      table: "wp_appq_evd_campaign",
      primaryKey: "id",
      fields: fields
        ? fields
        : [
            "id",
            "title",
            "is_public",
            "page_preview_id",
            "status_id",
            "start_date",
            "end_date",
            "close_date",
            "os",
          ],
    });
  }

  public createObject(row: CampaignType): CampaignObject {
    return new CampaignObject(row);
  }
}
export default Campaigns;
export { CampaignObject };
