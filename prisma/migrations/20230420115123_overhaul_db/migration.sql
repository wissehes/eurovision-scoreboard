-- CreateEnum
CREATE TYPE "EurovisionType" AS ENUM ('GRAND_FINAL', 'SEMI_1', 'SEMI_2', 'NATIONAL_FINAL');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "EurovisionYear" (
    "year" INTEGER NOT NULL,

    CONSTRAINT "EurovisionYear_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "EurovisionGroup" (
    "id" TEXT NOT NULL,
    "yearId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EurovisionType" NOT NULL,

    CONSTRAINT "EurovisionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongItem" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "youtubeURL" TEXT NOT NULL,
    "previewURL" TEXT,

    CONSTRAINT "SongItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRanking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "UserRanking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankedSong" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "songId" TEXT NOT NULL,
    "rankingId" TEXT NOT NULL,

    CONSTRAINT "RankedSong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "_EurovisionGroupToSongItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "_EurovisionGroupToSongItem_AB_unique" ON "_EurovisionGroupToSongItem"("A", "B");

-- CreateIndex
CREATE INDEX "_EurovisionGroupToSongItem_B_index" ON "_EurovisionGroupToSongItem"("B");

-- AddForeignKey
ALTER TABLE "EurovisionGroup" ADD CONSTRAINT "EurovisionGroup_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "EurovisionYear"("year") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongItem" ADD CONSTRAINT "SongItem_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRanking" ADD CONSTRAINT "UserRanking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRanking" ADD CONSTRAINT "UserRanking_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EurovisionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankedSong" ADD CONSTRAINT "RankedSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "SongItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankedSong" ADD CONSTRAINT "RankedSong_rankingId_fkey" FOREIGN KEY ("rankingId") REFERENCES "UserRanking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EurovisionGroupToSongItem" ADD CONSTRAINT "_EurovisionGroupToSongItem_A_fkey" FOREIGN KEY ("A") REFERENCES "EurovisionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EurovisionGroupToSongItem" ADD CONSTRAINT "_EurovisionGroupToSongItem_B_fkey" FOREIGN KEY ("B") REFERENCES "SongItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
