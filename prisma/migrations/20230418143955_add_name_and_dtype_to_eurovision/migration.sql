/*
  Warnings:

  - Added the required column `name` to the `EurovisionRankable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `EurovisionRankable` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EurovisionType" AS ENUM ('GRAND_FINAL', 'SEMI_1', 'SEMI_2', 'NATIONAL_FINAL');

-- AlterTable
ALTER TABLE "EurovisionRankable" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "type" "EurovisionType" NOT NULL;
