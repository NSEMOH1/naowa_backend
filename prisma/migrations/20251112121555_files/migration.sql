/*
  Warnings:

  - You are about to drop the column `recommendation` on the `loans` table. All the data in the column will be lost.
  - Added the required column `accountStatement` to the `loans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guarantorLetter` to the `loans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guarantorPassport` to the `loans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `incomeProof` to the `loans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalPassport` to the `loans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utilityBill` to the `loans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validId` to the `loans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."loans" DROP COLUMN "recommendation",
ADD COLUMN     "accountStatement" TEXT NOT NULL,
ADD COLUMN     "guarantorLetter" TEXT NOT NULL,
ADD COLUMN     "guarantorPassport" TEXT NOT NULL,
ADD COLUMN     "incomeProof" TEXT NOT NULL,
ADD COLUMN     "personalPassport" TEXT NOT NULL,
ADD COLUMN     "utilityBill" TEXT NOT NULL,
ADD COLUMN     "validId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."member" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
