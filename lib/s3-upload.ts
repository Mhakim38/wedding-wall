import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3";

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "wedding-wall";

export async function uploadToS3(
  s3Key: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  try {
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(putCommand);

    // Return public URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-southeast-1"}.amazonaws.com/${s3Key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
