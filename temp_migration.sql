-- Add subscription fields to WeddingSession
ALTER TABLE "WeddingSession" ADD COLUMN "subscriptionPackage" TEXT DEFAULT '7days' NOT NULL;
ALTER TABLE "WeddingSession" ADD COLUMN "subscriptionEndDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing subscriptionEndDate to be eventDate + 7 days
UPDATE "WeddingSession" SET "subscriptionEndDate" = "eventDate" + INTERVAL '7 days' WHERE "subscriptionEndDate" = CURRENT_TIMESTAMP;

-- Add TnC field to Guest
ALTER TABLE "Guest" ADD COLUMN "agreedToTnC" BOOLEAN DEFAULT false NOT NULL;

-- Update photoUploadLimit default from 1 to 2
ALTER TABLE "Guest" ALTER COLUMN "photoUploadLimit" SET DEFAULT 2;
