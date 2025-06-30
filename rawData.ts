export abstract class RawData {
  type: string;

  protected constructor(type: string, data:any) {
    this.type = type;
    this.mapMuIssueData = data;
  }

  accumulateData <t extends RawData>(data: t[]): void{}

  abstract mapMuIssueData(data: any): void;
}