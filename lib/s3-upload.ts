import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3";

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "wedding-wall";

export function validateContentType(contentType: string): string {
  // Allow common image MIME types
  const validImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
  ];
  
  if (!contentType || !validImageTypes.includes(contentType.toLowerCase())) {
    // Default to jpeg if unknown or invalid
    return 'image/jpeg';
  }
  
  return contentType.toLowerCase();
}

export async function uploadToS3(
  s3Key: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  try {
    const validatedContentType = validateContentType(contentType);

    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: validatedContentType,
    });

    await s3Client.send(putCommand);

    // Return public URL
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-southeast-1"}.amazonaws.com/${s3Key}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteFromS3(s3Key: string): Promise<void> {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(deleteCommand);
    console.log(`Deleted from S3: ${s3Key}`);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

