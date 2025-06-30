import { RawData } from "./rawData";

export interface ManualUploadAssetData {
  airid?: number;
  siteid?: number;
  assettype: string;
  primaryId: string;
  secondaryId: string;
}

export interface ManualUploadIssueData {
  primaryIdentifier: string;
  secondaryIdentifier?: string;
  Siteid?: number;
  aird?: number;
  issueId: string; // Use string to support IDs like 'IZ402'
  firstDetectedDate: string;
  lastDetectedDate: string;
  age: number;
}

export class MuIssueRawData extends RawData {
  public asset: ManualUploadAssetData;
  public issues: ManualUploadIssueData[];

  constructor(data: any) {
    super('muIssueRawData', data);

    this.asset = {
      airid: data['AIR ID'] ? Number(data['AIR ID']) : undefined,
      siteid: data['SITE ID'] ? Number(data['SITE ID']) : undefined,
      assettype: data['ASSET TYPE'] || '',
      primaryId: data['PRIMARY ID'] || '',
      secondaryId: data['SECONDARY ID'] || ''
    };

    const issueData: ManualUploadIssueData = {
      primaryIdentifier: data['PRIMARY ID'] || '',
      secondaryIdentifier: data['SECONDARY ID'] || '',
      Siteid: data['SITE ID'] ? Number(data['SITE ID']) : undefined,
      aird: data['AIR ID'] ? Number(data['AIR ID']) : undefined,
      issueId: data['ISSUE ID'] ? String(data['ISSUE ID']) : '',
      firstDetectedDate: data['FIRST DETECTED ON'] || '',
      lastDetectedDate: data['LAST DETECTED ON'] || '',
      age: 0 // You can add age calculation if needed
    };

    this.issues = [issueData];
  }

   mapMuIssueData(data: any): void {
    // You can leave this empty or implement mapping logic if needed
  }
}