/*
  Warnings:

  - You are about to drop the `RankedItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RankedItem" DROP CONSTRAINT "RankedItem_rankableItemId_fkey";

-- DropForeignKey
ALTER TABLE "RankedItem" DROP CONSTRAINT "RankedItem_userId_fkey";

-- DropTable
DROP TABLE "RankedItem";

-- CreateTable
CREATE TABLE "UserRanking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "UserRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RankableItemToUserRanking" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RankableItemToUserRanking_AB_unique" ON "_RankableItemToUserRanking"("A", "B");

-- CreateIndex
CREATE INDEX "_RankableItemToUserRanking_B_index" ON "_RankableItemToUserRanking"("B");

-- AddForeignKey
ALTER TABLE "UserRanking" ADD CONSTRAINT "UserRanking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRanking" ADD CONSTRAINT "UserRanking_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EurovisionRankable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RankableItemToUserRanking" ADD CONSTRAINT "_RankableItemToUserRanking_A_fkey" FOREIGN KEY ("A") REFERENCES "RankableItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RankableItemToUserRanking" ADD CONSTRAINT "_RankableItemToUserRanking_B_fkey" FOREIGN KEY ("B") REFERENCES "UserRanking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
