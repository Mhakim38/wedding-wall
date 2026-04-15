-- Add subscription fields to WeddingSession
ALTER TABLE "WeddingSession" ADD COLUMN IF NOT EXISTS "subscriptionPackage" TEXT DEFAULT '7days' NOT NULL;
ALTER TABLE "WeddingSession" ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3);

-- Update existing records - set subscriptionEndDate to eventDate + 7 days
UPDATE "WeddingSession" 
SET "subscriptionEndDate" = "eventDate" + INTERVAL '7 days' 
WHERE "subscriptionEndDate" IS NULL;

-- Make subscriptionEndDate NOT NULL
ALTER TABLE "WeddingSession" ALTER COLUMN "subscriptionEndDate" SET NOT NULL;

-- Add TnC field to Guest
ALTER TABLE "Guest" ADD COLUMN IF NOT EXISTS "agreedToTnC" BOOLEAN DEFAULT false NOT NULL;

-- Update photoUploadLimit default from 1 to 2
ALTER TABLE "Guest" ALTER COLUMN "photoUploadLimit" SET DEFAULT 2;
