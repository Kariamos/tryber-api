import Attributions from "./mockedDb/attributions";
import bugMedia from "./mockedDb/bugMedia";
import Candidature from "./mockedDb/cpHasCandidates";
import CustomBugTypes from "./mockedDb/customBugTypes";
import CustomReplicabilities from "./mockedDb/customReplicabilities";
import CustomSeverities from "./mockedDb/customSeverities";
import Campaigns from "./mockedDb/campaign";
import BugTypes from "./mockedDb/bugTypes";
import Replicabilities from "./mockedDb/bugReplicabilities";
import Severities from "./mockedDb/bugSeverities";
import WpOptions from "./mockedDb/wp_options";
import CampaignAdditionals from "./mockedDb/campaignAdditionals";
import CampaignMeta from "./mockedDb/campaignMeta";
import UseCaseGroups from "./mockedDb/usecasesGroups";
import UseCases from "./mockedDb/usecases";
import UploadedMedia from "@src/__mocks__/mockedDb/uploadedMedia";
import PreselectionForm from "./mockedDb/preselectionForm";
import PreselectionFormFields from "./mockedDb/preselectionFormFields";

import { table as bugAdditionalFields } from "@src/__mocks__/mockedDb/bugHasAdditionalFields";
import { table as levelDefTable } from "@src/__mocks__/mockedDb/levelsDefinition";
import { table as bugTable } from "./mockedDb/bug";
import { table as bugStatus } from "./mockedDb/bugStatus";
import { table as certificationListTable } from "./mockedDb/certificationList";
import { table as cufTable } from "./mockedDb/customUserFields";
import { table as cufDataTable } from "./mockedDb/customUserFieldsData";
import { table as cufExtraTable } from "./mockedDb/customUserFieldsExtra";
import deviceOs from "./mockedDb/deviceOs";
import DevicePlatform from "./mockedDb/devicePlatform";
import { table as educationListTable } from "./mockedDb/educationList";
import { table as employmentListTable } from "./mockedDb/employmentList";
import { table as expTable } from "./mockedDb/experience";
import { table as fiscalProfileTable } from "./mockedDb/fiscalProfile";
import { table as languageListTable } from "./mockedDb/languageList";
import { table as levelTable } from "./mockedDb/levels";
import { table as levelRevTable } from "./mockedDb/levelsRevisions";
import { table as paymentRequestTable } from "./mockedDb/paymentRequest";
import { table as popupTable } from "./mockedDb/popups";
import { table as testerTable } from "./mockedDb/profile";
import { table as receiptTable } from "./mockedDb/receipt";
import { table as testerCertificationTable } from "./mockedDb/testerCertification";
import TesterDevice from "./mockedDb/testerDevice";
import { table as testerLanguageTable } from "./mockedDb/testerLanguage";
import { table as deletionReasonTable } from "./mockedDb/userDeletionReason";
import { table as workTypeTable } from "./mockedDb/workType";
import { table as wpUserMetaTable } from "./mockedDb/wp_usermeta";
import { table as wpUsersTable } from "./mockedDb/wp_users";
import sqlite3 from "@src/features/sqlite";

export {};
beforeAll(async () => {
  await levelRevTable.create();
  await receiptTable.create();
  await workTypeTable.create();
  await popupTable.create();
  await DevicePlatform.mock();
  await deviceOs.mock();
  await wpUserMetaTable.create();
  await deletionReasonTable.create();
  await fiscalProfileTable.create();
  await expTable.create();
  await Campaigns.mock();
  await Candidature.mock();
  await testerTable.create();
  await wpUsersTable.create();
  await levelTable.create();
  await levelDefTable.create();
  await cufDataTable.create();
  await TesterDevice.mock();
  await bugTable.create();
  await certificationListTable.create();
  await testerCertificationTable.create();
  await languageListTable.create();
  await employmentListTable.create();
  await educationListTable.create();
  await testerLanguageTable.create();
  await cufTable.create();
  await cufExtraTable.create();
  await WpOptions.mock();
  await Severities.mock();
  await BugTypes.mock();
  await CustomBugTypes.mock();
  await bugStatus.create();
  await bugAdditionalFields.create();
  await paymentRequestTable.create();
  await sqlite3.run(`
  CREATE TRIGGER "on_update__update_date"
    BEFORE UPDATE ON "wp_appq_payment_request" FOR EACH ROW 
    BEGIN
    UPDATE wp_appq_payment_request set update_date = CURRENT_TIMESTAMP where id = NEW.id;
    END`);

  await CustomSeverities.mock();
  await Replicabilities.mock();
  await CustomReplicabilities.mock();
  await UseCases.mock();
  await CampaignAdditionals.mock();
  await CampaignMeta.mock();
  await UseCaseGroups.mock();
  await Attributions.mock();
  await bugMedia.mock();
  await UploadedMedia.mock();
  await PreselectionForm.mock();
  await PreselectionFormFields.mock();
});
