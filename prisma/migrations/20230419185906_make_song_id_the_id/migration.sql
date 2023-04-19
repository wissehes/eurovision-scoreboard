/*
  Warnings:

  - The primary key for the `RankedSong` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `RankedSong` table. All the data in the column will be lost.
  - You are about to drop the column `rankableItemId` on the `RankedSong` table. All the data in the column will be lost.
  - Added the required column `songId` to the `RankedSong` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RankedSong" DROP CONSTRAINT "RankedSong_rankableItemId_fkey";

-- AlterTable
ALTER TABLE "RankedSong" DROP CONSTRAINT "RankedSong_pkey",
DROP COLUMN "id",
DROP COLUMN "rankableItemId",
ADD COLUMN     "songId" TEXT NOT NULL,
ADD CONSTRAINT "RankedSong_pkey" PRIMARY KEY ("songId");

-- AddForeignKey
ALTER TABLE "RankedSong" ADD CONSTRAINT "RankedSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "RankableItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
