-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "rentalDepositPercentOfPrice" INTEGER NOT NULL DEFAULT 25;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "depositCents" INTEGER NOT NULL DEFAULT 0;
