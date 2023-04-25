-- DropForeignKey
ALTER TABLE "UserRanking" DROP CONSTRAINT "UserRanking_groupId_fkey";

-- DropForeignKey
ALTER TABLE "UserRanking" DROP CONSTRAINT "UserRanking_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserRanking" ADD CONSTRAINT "UserRanking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRanking" ADD CONSTRAINT "UserRanking_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EurovisionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
