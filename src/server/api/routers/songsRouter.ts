import { type PrismaPromise } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  // protectedProcedure,
  adminProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import delay from "~/utils/delay";
import { fetchiTunesData } from "~/utils/fetchiTunesData";
import { getUserRanking } from "~/utils/ranking/getUserRanking";

export const songsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.songItem.findMany({
      include: {
        country: true,
        groups: { include: { year: true } },
      },
    });
  }),

  getForYear: publicProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.songItem.findMany({
        where: {
          groups: {
            some: {
              yearId: input.year,
            },
          },
        },
        include: {
          groups: {
            select: {
              id: true,
            },
          },
          country: true,
        },
      });
    }),

  getForYearItem: publicProcedure
    .input(z.object({ year: z.number(), id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.eurovisionGroup.findFirst({
        where: { yearId: input.year, id: input.id },
        include: { items: { include: { country: true } } },
      });
    }),

  getForRankedYearGroup: protectedProcedure
    .input(z.object({ year: z.number(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      try {
        const data = getUserRanking({
          userId,
          groupId: input.id,
          year: input.year,
        });
        return data;
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
    }),

  saveRanking: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        id: z.string(),
        items: z.array(z.object({ id: z.string(), rank: z.number().min(1) })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.eurovisionGroup.findUnique({
        where: { id: input.id },
        include: {
          items: true,
          rankings: {
            where: {
              userId: ctx.session.user.id,
            },
            include: {
              rankedSongs: true,
            },
          },
        },
      });
      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const userId = ctx.session.user.id;
      const ranking = group.rankings[0];

      if (ranking) {
        // update

        const transactions = input.items.map((i) => {
          const ranked = ranking.rankedSongs.find((a) => a.songId == i.id);

          return ctx.prisma.rankedSong.upsert({
            where: { id: ranked?.id ?? "" },
            create: {
              rank: i.rank,
              song: { connect: { id: i.id } },
              ranking: { connect: { id: ranking.id } },
            },
            update: {
              rank: i.rank,
            },
          });
        });

        return ctx.prisma.$transaction(transactions);
      } else {
        // create
        return ctx.prisma.userRanking.create({
          data: {
            group: { connect: { id: group.id } },
            user: { connect: { id: userId } },
            rankedSongs: {
              createMany: {
                data: input.items.map((a) => ({ rank: a.rank, songId: a.id })),
              },
            },
          },
        });
      }
    }),

  addToYearItem: adminProcedure
    .input(
      z.object({
        year: z.number().min(1950),
        itemId: z.string().nonempty(),
        country: z.string().nonempty("Country can't be empty!"),
        title: z.string().nonempty("Title can't be empty!"),
        artist: z.string().nonempty("Artist can't be empty!"),
        youtube: z.string().url("YouTube URL Must be an actual url!"),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.songItem.create({
        data: {
          country: { connect: { id: input.country } },
          title: input.title,
          artist: input.artist,
          youtubeURL: input.youtube,
          groups: { connect: { id: input.itemId } },
        },
      });
    }),

  updatePreviews: adminProcedure.mutation(async ({ ctx: { prisma } }) => {
    const songs = await prisma.songItem.findMany({
      where: { previewURL: null },
    });

    const transactions: PrismaPromise<unknown>[] = [];

    for (const song of songs) {
      try {
        const { data } = await fetchiTunesData(song);
        const item = data.results.find(
          (s) => s.artworkUrl100 && s.previewUrl !== undefined
        );
        if (!item || !item.previewUrl) continue;
        console.log(`[SONG_UPDATER] ${song.artist} - ${song.title} updated`);
        transactions.push(
          prisma.songItem.update({
            where: { id: song.id },
            data: {
              previewURL: item.previewUrl,
              artworkURL: item.artworkUrl100,
            },
          })
        );

        await delay(500);
      } catch {
        continue;
      }
    }

    await prisma.$transaction(transactions);

    return true;
  }),
});
