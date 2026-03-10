-- Create WeddingSession table
CREATE TABLE "WeddingSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" VARCHAR(8) NOT NULL UNIQUE,
  "eventName" TEXT NOT NULL,
  "eventDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL
);

-- Create index on code
CREATE INDEX "WeddingSession_code_idx" ON "WeddingSession"("code");
CREATE INDEX "WeddingSession_createdAt_idx" ON "WeddingSession"("createdAt");

-- Create Guest table
CREATE TABLE "Guest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Guest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WeddingSession"("id") ON DELETE CASCADE
);

-- Create unique constraint on sessionId + email
CREATE UNIQUE INDEX "Guest_sessionId_email_key" ON "Guest"("sessionId", "email");
CREATE INDEX "Guest_sessionId_idx" ON "Guest"("sessionId");

-- Create Photo table
CREATE TABLE "Photo" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "guestId" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "s3Url" TEXT NOT NULL,
  "s3Key" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "fileSize" INTEGER,
  "mimeType" TEXT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Photo_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WeddingSession"("id") ON DELETE CASCADE,
  CONSTRAINT "Photo_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE
);

-- Create indexes on Photo
CREATE INDEX "Photo_sessionId_idx" ON "Photo"("sessionId");
CREATE INDEX "Photo_guestId_idx" ON "Photo"("guestId");
CREATE INDEX "Photo_uploadedAt_idx" ON "Photo"("uploadedAt");

-- Create UploadToken table
CREATE TABLE "UploadToken" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "guestId" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "used" BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT "UploadToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WeddingSession"("id") ON DELETE CASCADE,
  CONSTRAINT "UploadToken_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE
);

-- Create indexes on UploadToken
CREATE INDEX "UploadToken_sessionId_idx" ON "UploadToken"("sessionId");
CREATE INDEX "UploadToken_guestId_idx" ON "UploadToken"("guestId");
CREATE INDEX "UploadToken_expiresAt_idx" ON "UploadToken"("expiresAt");
CREATE INDEX "UploadToken_token_idx" ON "UploadToken"("token");
