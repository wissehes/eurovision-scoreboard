import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  //   protectedProcedure,
} from "~/server/api/trpc";

export const groupRouter = createTRPCRouter({
  getItems: publicProcedure
    .input(z.object({ year: z.number(), id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.eurovisionGroup.findFirst({
        where: { yearId: input.year, id: input.id },
        include: { items: { include: { country: true } } },
      });
    }),
});
