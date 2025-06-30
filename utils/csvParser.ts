import { Readable } from "stream";
import { RawData } from "../rawData";
import * as fastcsv from "fast-csv";

export interface CsvParserOptions {
  headers?: boolean | string[];
  delimiter?: string;
  skipRows?: number;
}

type RawDataConstructor<T extends RawData> = new (data: any) => T;

export class CsvParser {
  /**
   * Parses a CSV stream and maps each row to a RawData-derived class.
   * @param file Not used, but kept for interface compatibility.
   * @param DataClass The class to instantiate for each row.
   * @param options CSV parsing options.
   * @param stream The readable stream of CSV data.
   * @param accumulate If true, calls accumulateData on each mapped record.
   * @param parsedData Optional extra data to merge into each row.
   */
  parse<R extends RawData>(
    file: string,
    DataClass: RawDataConstructor<R>,
    options: CsvParserOptions,
    stream?: Readable,
    accumulate: boolean = false,
    parsedData?: any
  ): Promise<R[]> {
    return new Promise<R[]>((resolve, reject) => {
      const responseObj: R[] = [];

      if (!stream) {
        reject(new Error("No stream provided for CSV parsing"));
        return;
      }

      const csvStream = fastcsv
        .parseStream(stream, {
          headers: options.headers,
          delimiter: options.delimiter,
          skipRows: options.skipRows,
          ignoreEmpty: true
        })
        .on("error", (error) => {
          stream.destroy?.();
          reject(error);
        })
        .on("data", (row) => {
          try {
            const enrichedRecord = parsedData ? { ...row, ...parsedData } : row;
            const mappedRecord = new DataClass(enrichedRecord);

            if (accumulate) {
              if (typeof (mappedRecord as any).accumulateData === "function") {
                (mappedRecord as any).accumulateData(responseObj);
              } else {
                throw new Error("accumulateData method not implemented");
              }
            } else {
              responseObj.push(mappedRecord);
            }
          } catch (error) {
            csvStream.destroy?.();
            reject(error);
          }
        })
        .on("end", () => {
          resolve(responseObj);
        });
    });
  }
}