import {
  createTRPCRouter,
  // publicProcedure,
  // protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: { accounts: { select: { provider: true } } },
    });
  }),
});
