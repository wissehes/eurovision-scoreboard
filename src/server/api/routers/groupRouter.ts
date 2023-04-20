import { z } from "zod";

import {
  adminProcedure,
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
});
