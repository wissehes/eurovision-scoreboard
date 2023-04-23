import { type Country } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  //   protectedProcedure,
} from "~/server/api/trpc";
import { rankToPoints } from "~/utils/rankToPoints";

export const groupRouter = createTRPCRouter({
  getItems: publicProcedure
    .input(z.object({ year: z.number(), id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.eurovisionGroup.findFirst({
        where: { yearId: input.year, id: input.id },
        include: { items: { include: { country: true } } },
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        year: z.number(),
        name: z.string(),
        type: z.enum([
          "GRAND_FINAL",
          "SEMI_1",
          "SEMI_2",
          "NATIONAL_FINAL",
          "GROUP",
          "ALL_SONGS",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.eurovisionGroup.create({
        data: {
          name: input.name,
          type: input.type,
          year: {
            connectOrCreate: {
              create: { year: input.year },
              where: { year: input.year },
            },
          },
        },
      });
    }),

  setSongs: adminProcedure
    .input(z.object({ songIds: z.string().array(), groupId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.eurovisionGroup.update({
        where: { id: input.groupId },
        data: {
          items: {
            set: input.songIds.map((s) => ({ id: s })),
          },
        },
      });
    }),

  totalPoints: protectedProcedure
    .input(z.object({ year: z.number(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.prisma.eurovisionGroup.findFirst({
        where: { yearId: input.year, id: input.id },
        include: {
          items: { include: { country: true } },
          rankings: {
            include: {
              rankedSongs: {
                include: { song: { include: { country: true } } },
                orderBy: { rank: "asc" },
                take: 10,
              },
            },
          },
        },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      // id: country id
      const countries = new Map<string, { points: number; country: Country }>();

      for (const ranking of group.rankings) {
        for (const ranked of ranking.rankedSongs) {
          const points = rankToPoints(ranked.rank);
          if (points == 0) continue;
          const countryId = ranked.song.countryId;
          const currentPoints = countries.get(countryId) ?? {
            country: ranked.song.country,
            points: 0,
          };

          countries.set(countryId, {
            ...currentPoints,
            points: currentPoints.points + points,
          });
        }
      }

      const mapped = Array.from(countries).map(([countryId, points]) => {
        return {
          ...points,
          song: group.items.find((a) => a.countryId == countryId),
        };
      });

      return mapped.sort((a, b) => b.points - a.points);
    }),
});
