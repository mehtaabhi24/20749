import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export function getCsvStream(filePath: string): Readable {
  const ext = path.extname(filePath).toLowerCase();

  if (ext !== '.csv') {
    throw new Error(`Invalid file type: ${ext}. Only CSV files are supported.`);
  }

  return fs.createReadStream(filePath);
}
