import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:4566",
  forcePathStyle: true,
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
});

export async function getS3Stream(bucket: string, key: string): Promise<Readable> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3.send(command);

  const body = response.Body;

  if (!body) {
    throw new Error("S3 object has no body");
  }

  // For Node.js, body is already a Readable
  if (typeof (body as any).pipe === "function") {
    return body as Readable;
  }

  // Otherwise, it's a ReadableStream (e.g., in Edge runtimes or browser-like environments)
  // Convert it into a Node.js Readable
  // @ts-ignore
  return Readable.fromWeb(body as ReadableStream);
}
