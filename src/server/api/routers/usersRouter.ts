import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  // publicProcedure,
  // protectedProcedure,
  adminProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: { accounts: { select: { provider: true } } },
    });
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: { accounts: { select: { provider: true } } },
    });
    if (!data) throw new TRPCError({ code: "BAD_REQUEST" });
    return data;
  }),

  updateName: protectedProcedure
    .input(z.object({ name: z.string().min(3).max(32) }))
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input.name },
      })
    ),
});
