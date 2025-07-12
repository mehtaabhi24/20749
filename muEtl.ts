import { EtlInput, EtlOutput, EtlType } from "./sharedinterface";
import { Logger } from "./logging";
import { Database } from "./database";
import { getCsvStream } from "./utils/utils";
import { CsvParser, CsvParserOptions } from "./utils/csvParser";
import { MuIssueRawData } from "./muEtlrawData";
import { Readable } from "stream";
import { getS3Stream } from "./utils/s3FileDownload";
import { promises } from "dns";

export class muEtl {
  type: EtlType;
  logger: Logger;
  db: Database;

  constructor(type: EtlType, logger: Logger, db: Database) {
    this.type = type;
    this.logger = logger;
    this.db = db;
  }

  async init() {
    try {
      await this.db.connect();
      this.logger.info(
        `Database connection established for ETL type: ${this.type}`
      );
    } catch (error) {
      this.logger.error(`Failed to connect to the database:`);
      throw error;
    }
  }

  public etlProcess(etlInput: EtlInput): Promise<EtlOutput> {
    let parsedData: MuIssueRawData[];
    return new Promise<EtlOutput>(async (resolve, reject) => {
      try {
        this.logger.info(`Starting ETL process for type: ${this.type}`);

        // Initialize the database connection
        await this.init();

        // Get the CSV stream
        let csvStream;

        if (etlInput.sourceType === "S3") {
          this.logger.info(`Fetching CSV from S3: ${etlInput.dataLocation}`);
          // Split dataLocation into bucket and key
          const [bucket, ...keyParts] = etlInput.dataLocation.split("/");
          const key = keyParts.join("/");
          csvStream = await getS3Stream(bucket, key);
        } else if (etlInput.sourceType === "CSV") {
          // If the source is a local file, use the getCsvStream function
          this.logger.info(
            `Fetching CSV from local file: ${etlInput.dataLocation}`
          );
          csvStream = getCsvStream(etlInput.dataLocation);
        } else {
          throw new Error(`Unsupported source type: ${etlInput.sourceType}`);
        }

        // Process the CSV stream and perform ETL operations
        // This is a placeholder for actual ETL logic
        this.logger.info(`Processing file: ${etlInput.sourceType}`);

        parsedData = await this.processCsv(csvStream);
        this.logger.info(`Finished parsing csv data`);
        console.log("parsedData............", parsedData);

        // process the issues and assets
        await this.processIssues(parsedData);

        resolve({
          issueIds: parsedData
            .map((data) => data.issues.map((issue) => issue.issueId))
            .flat(),
          message: "ETL process completed successfully",
          etlStopped: false,
        });
      } catch (error) {
        this.logger.error(`ETL process failed:`);
        reject(error);
      } finally {
        this.db.close();
        this.logger.info(
          `Database connection closed for ETL type: ${this.type}`
        );
      }
    });
  }

  private async processCsv(csvStream: Readable): Promise<MuIssueRawData[]> {
    const parser = new CsvParser();
    const options: CsvParserOptions = {
      headers: true, // This will use the first row as headers
      delimiter: ",",
      skipRows: 0,
    };

    try {
      const parsedData = await parser.parse<MuIssueRawData>(
        "",
        MuIssueRawData,
        options,
        csvStream,
        false
      );

      this.logger.info("CSV parsing completed successfully");
      return parsedData;
    } catch (error) {
      this.logger.error(`CSV parsing failed: ${error}`);
      throw error;
    }
  }

  async processIssues(muData: MuIssueRawData[]): Promise<void> {
    try {
      this.logger.info("Starting to process assets and issues...");

      // Process assets first
      for (const data of muData) {
        console.log("mydata", data);
        // Insert asset data
        const assetQuery = `
        INSERT INTO assets (air_id, site_id, asset_type, primary_id, secondary_id)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        asset_type = VALUES(asset_type),
        secondary_id = VALUES(secondary_id)`;

        const assetValues = [
          data.asset.airid,
          data.asset.siteid,
          data.asset.assettype,
          data.asset.primaryId,
          data.asset.secondaryId,
        ];

        await this.db.query(assetQuery, assetValues);
        this.logger.info(`Asset processed: ${data.asset.primaryId}`);

        // Process issues for this asset
        for (const issue of data.issues) {
          const issueQuery = `
          INSERT INTO issues (
            primary_id, 
            secondary_id, 
            site_id, 
            air_id,
            issue_id, 
            first_detected_on,
            last_detected_on,
            age
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          last_detected_on = VALUES(last_detected_on),
          age = VALUES(age)`;

          const issueValues = [
            issue.primaryIdentifier,
            issue.secondaryIdentifier,
            issue.Siteid,
            issue.aird,
            issue.issueId,
            issue.firstDetectedDate,
            issue.lastDetectedDate,
            issue.age,
          ];

          await this.db.query(issueQuery, issueValues);
          this.logger.info(`Issue processed: ${issue.issueId}`);
        }
      }

      this.logger.info("Completed processing assets and issues");
    } catch (error) {
      this.logger.error(`Error processing issues: ${error}`);
      throw error;
    }
  }
}
