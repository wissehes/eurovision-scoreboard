import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const songsRouter = createTRPCRouter({
  getForYearItem: publicProcedure
    .input(z.object({ year: z.number(), id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.eurovisionRankable.findFirst({
        where: { eurovisionYearYear: input.year, id: input.id },
        include: { items: { include: { country: true } } },
      });
    }),

  addToYearItem: protectedProcedure
    .input(
      z.object({
        year: z.number().min(1950),
        itemId: z.string().nonempty(),
        country: z.string().nonempty(),
        title: z.string().nonempty(),
        artist: z.string().nonempty(),
        youtube: z.string().url(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.rankableItem.create({
        data: {
          country: { connect: { id: input.country } },
          title: input.title,
          artist: input.artist,
          youtubeURL: input.youtube,
          group: { connect: { id: input.itemId } },
        },
      });
    }),
});
