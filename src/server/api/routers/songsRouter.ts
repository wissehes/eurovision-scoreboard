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
      orderBy: {
        country: { fullname: "asc" },
      },
    });
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.songItem.findUnique({
        where: { id: input.id },
        include: { country: true },
      })
    ),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().nonempty(),

        countryId: z.string().nonempty("Country can't be empty!"),
        title: z.string().nonempty("Title can't be empty!"),
        artist: z.string().nonempty("Artist can't be empty!"),
        youtubeURL: z.string().url("YouTube URL Must be an actual url!"),
        previewURL: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.songItem.update({ where: { id: input.id }, data: input })
    ),

  getForYear: publicProcedure
    .input(z.object({ year: z.number(), filter: z.boolean().default(true) }))
    .query(async ({ ctx, input }) => {
      const allSongs = await ctx.prisma.songItem.findMany({
        include: {
          groups: {
            select: {
              id: true,
              yearId: true,
            },
          },
          country: true,
        },
        orderBy: {
          country: {
            fullname: "asc",
          },
        },
      });

      const forThisYear = allSongs.filter((a) =>
        a.groups.find((b) => b.yearId == input.year)
      );

      return input.filter ? forThisYear : allSongs;
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

  updatePreview: adminProcedure
    .input(z.object({ songId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const song = await ctx.prisma.songItem.findUnique({
        where: { id: input.songId },
      });
      if (!song) throw new TRPCError({ code: "NOT_FOUND" });
      const { data } = await fetchiTunesData({
        title: song.title,
        artist: song.artist,
      });
      const firstItem = data.results.filter(
        (s) =>
          s.artworkUrl100 &&
          s.previewUrl !== undefined &&
          !s.trackName.toLowerCase().includes("karaoke")
      )[1];

      if (!firstItem) throw new TRPCError({ code: "BAD_REQUEST" });

      return ctx.prisma.songItem.update({
        where: { id: song.id },
        data: {
          previewURL: firstItem.previewUrl,
          artworkURL: firstItem.artworkUrl100,
        },
      });
    }),
});
