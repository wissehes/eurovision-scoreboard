import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  // protectedProcedure,
  adminProcedure,
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
