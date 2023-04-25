-- AlterTable
ALTER TABLE "EurovisionYear" ADD COLUMN     "hostCity" TEXT,
ADD COLUMN     "hostCountryId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "EurovisionYear" ADD CONSTRAINT "EurovisionYear_hostCountryId_fkey" FOREIGN KEY ("hostCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
