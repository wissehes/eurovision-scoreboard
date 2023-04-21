/**
 * Get a user's ranking
 * -> Look up the group, error if non existent
 * -> Look up the user's ranking, if it exists
 * -> ranked songs and unranked songs
 */

import { prisma } from "~/server/db";

interface userRankingParams {
  userId: string;
  year: number;
  groupId: string;
}

export const getUserRanking = async ({
  userId,
  year,
  groupId,
}: userRankingParams) => {
  //   const userId = ctx.session.user.id;

  const group = await prisma.eurovisionGroup.findFirst({
    where: { yearId: year, id: groupId },
    include: {
      items: {
        include: { country: true },
      },
    },
  });

  if (!group) {
    throw Error("GROUP_404");
  }

  const myRanking = await prisma.userRanking.findFirst({
    where: { userId, groupId },
    include: {
      rankedSongs: {
        include: {
          song: {
            include: {
              country: true,
            },
          },
        },
        orderBy: {
          rank: "asc",
        },
      },
    },
  });

  const unrankedSongs = group.items.filter(
    (a) => !myRanking?.rankedSongs.find((b) => a.id == b.song.id)
  );

  return {
    id: group.id,
    name: group.name,
    type: group.type,
    year: group.yearId,
    myRanking,
    unrankedSongs,
  };
};

export type RankingData = Awaited<ReturnType<typeof getUserRanking>>;
