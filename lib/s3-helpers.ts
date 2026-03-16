import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "./s3";

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "wedding-wall";
const UPLOAD_EXPIRATION = 15 * 60; // 15 minutes

export async function generatePresignedUploadUrl(
  sessionId: string,
  fileName: string,
  contentType: string
): Promise<{
  uploadUrl: string;
  s3Key: string;
}> {
  try {
    // Generate S3 key path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const s3Key = `photos/${sessionId}/${timestamp}-${sanitizedFileName}`;

    // Create PutObject command
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: contentType,
    });

    // Generate signed URL
    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: UPLOAD_EXPIRATION,
    });

    return {
      uploadUrl,
      s3Key,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate upload URL");
  }
}

export function getPublicS3Url(s3Key: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-southeast-1"}.amazonaws.com/${s3Key}`;
}
