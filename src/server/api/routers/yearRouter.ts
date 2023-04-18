import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  //   protectedProcedure,
} from "~/server/api/trpc";

export const yearRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.eurovisionYear.findMany({ include: { items: true } });
  }),

  get: publicProcedure
    .input(z.object({ year: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.eurovisionYear.findUnique({
        where: { year: input.year },
        include: { items: { include: { items: true } } },
      });
    }),
});
