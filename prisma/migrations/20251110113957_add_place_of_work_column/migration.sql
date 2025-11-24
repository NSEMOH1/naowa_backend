/*
  Warnings:

  - Added the required column `place_of_work` to the `member` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."member" ADD COLUMN     "place_of_work" TEXT NOT NULL;
