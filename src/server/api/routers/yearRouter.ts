import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
  //   protectedProcedure,
} from "~/server/api/trpc";

export const yearRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.eurovisionYear.findMany({ include: { items: true } });
  }),

  get: publicProcedure
    .input(z.object({ year: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.eurovisionYear.findUnique({
        where: { year: input.year },
        include: {
          items: { include: { items: true }, orderBy: { type: "asc" } },
        },
      });
    }),

  create: adminProcedure
    .input(z.object({ year: z.number().min(1950) }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.prisma.eurovisionYear.findFirst({
        where: { year: input.year },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "That year already exists.",
        });
      }

      return ctx.prisma.eurovisionYear.create({
        data: {
          year: input.year,
        },
      });
    }),
});
