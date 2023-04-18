-- CreateTable
CREATE TABLE "EurovisionYear" (
    "year" INTEGER NOT NULL,

    CONSTRAINT "EurovisionYear_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "EurovisionRankable" (
    "id" TEXT NOT NULL,
    "eurovisionYearYear" INTEGER NOT NULL,

    CONSTRAINT "EurovisionRankable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankableItem" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeURL" TEXT NOT NULL,
    "previewURL" TEXT,
    "countryId" TEXT NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "RankableItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankedItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rankableItemId" TEXT NOT NULL,
    "rank" INTEGER,

    CONSTRAINT "RankedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EurovisionRankable" ADD CONSTRAINT "EurovisionRankable_eurovisionYearYear_fkey" FOREIGN KEY ("eurovisionYearYear") REFERENCES "EurovisionYear"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankableItem" ADD CONSTRAINT "RankableItem_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankableItem" ADD CONSTRAINT "RankableItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EurovisionRankable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankedItem" ADD CONSTRAINT "RankedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankedItem" ADD CONSTRAINT "RankedItem_rankableItemId_fkey" FOREIGN KEY ("rankableItemId") REFERENCES "RankableItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
