import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  // protectedProcedure,
  adminProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const songsRouter = createTRPCRouter({
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

      const group = await ctx.prisma.eurovisionGroup.findFirst({
        where: { yearId: input.year, id: input.id },
        include: {
          items: {
            include: { country: true },
          },
        },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const myRanking = await ctx.prisma.userRanking.findFirst({
        where: { userId },
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
        (a) => !myRanking?.rankedSongs.find((b) => a.id == b.id)
      );

      return {
        id: group.id,
        name: group.name,
        type: group.type,
        year: group.yearId,
        myRanking,
        unrankedSongs,
      };
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

      if (group.rankings[0]) {
        // update

        const transactions = input.items.map((i) => {
          const ranked = group.rankings[0]?.rankedSongs.find(
            (a) => a.songId == i.id
          );
          console.log(ranked);
          // if (!ranked) return new Promise((res) => res(null));
          return ctx.prisma.rankedSong.update({
            where: { id: ranked?.id },
            data: { rank: i.rank },
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
});
