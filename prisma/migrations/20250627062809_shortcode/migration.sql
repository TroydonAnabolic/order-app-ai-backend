/*
  Warnings:

  - A unique constraint covering the columns `[shortCode]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shortCode` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "shortCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_shortCode_key" ON "Reservation"("shortCode");
