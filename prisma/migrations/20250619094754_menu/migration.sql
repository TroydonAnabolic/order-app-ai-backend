/*
  Warnings:

  - You are about to drop the column `stripePricingId` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `stripeProductId` on the `MenuItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "stripePricingId",
DROP COLUMN "stripeProductId",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "size" TEXT NOT NULL DEFAULT 'Medium',
ADD COLUMN     "specialInstructions" TEXT NOT NULL DEFAULT 'No special instructions',
ALTER COLUMN "price" SET DEFAULT 0.0;
