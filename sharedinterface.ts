export interface EtlInput {
  dataSource: string;
  dataLocation: string;
  sourceType: string;
}

export interface EtlOutput {
  issueIds: string[];
  message: string;
  etlStopped: boolean;
}

export enum EtlType {
  muEtl = 'muEtl'
}