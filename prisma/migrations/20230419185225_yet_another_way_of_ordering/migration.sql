/*
  Warnings:

  - You are about to drop the column `order` on the `UserRanking` table. All the data in the column will be lost.
  - You are about to drop the `_RankableItemToUserRanking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RankableItemToUserRanking" DROP CONSTRAINT "_RankableItemToUserRanking_A_fkey";

-- DropForeignKey
ALTER TABLE "_RankableItemToUserRanking" DROP CONSTRAINT "_RankableItemToUserRanking_B_fkey";

-- AlterTable
ALTER TABLE "UserRanking" DROP COLUMN "order";

-- DropTable
DROP TABLE "_RankableItemToUserRanking";

-- CreateTable
CREATE TABLE "RankedSong" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "rankableItemId" TEXT NOT NULL,
    "rankingId" TEXT NOT NULL,

    CONSTRAINT "RankedSong_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RankedSong" ADD CONSTRAINT "RankedSong_rankableItemId_fkey" FOREIGN KEY ("rankableItemId") REFERENCES "RankableItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankedSong" ADD CONSTRAINT "RankedSong_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "UserRanking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
