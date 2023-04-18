import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  //   protectedProcedure,
} from "~/server/api/trpc";

export const rankableRouter = createTRPCRouter({
  getItems: publicProcedure
    .input(z.object({ year: z.number(), id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.eurovisionRankable.findFirst({
        where: { eurovisionYearYear: input.year, id: input.id },
        include: { items: { include: { country: true } } },
      });
    }),
});
