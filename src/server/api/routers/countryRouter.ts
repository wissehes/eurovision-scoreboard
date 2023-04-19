import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  // protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";

import { parse as parseCSV } from "csv-string";
import { type Comma } from "csv-string/dist/types";
import delay from "~/utils/delay";
import { TRPCError } from "@trpc/server";

export const countryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.country.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { id: "asc" },
    });
  }),

  getAvailableCountries: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const countries = await ctx.prisma.country.findMany({
        include: { _count: { select: { items: true } } },
        orderBy: { id: "asc" },
      });
      const group = await ctx.prisma.eurovisionRankable.findUnique({
        where: { id: input.groupId },
        select: { items: { select: { countryId: true } } },
      });

      if (!group) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const existingCountries = group.items.map((i) => i.countryId);

      return countries.filter((c) => !existingCountries.includes(c.id));
    }),

  create: adminProcedure
    .input(z.object({ abbreviation: z.string(), fullname: z.string().min(3) }))
    .mutation(({ ctx, input: { abbreviation, fullname } }) => {
      return ctx.prisma.country.create({
        data: { id: abbreviation, fullname },
      });
    }),

  createFromCSV: adminProcedure
    .input(
      z.object({
        csvText: z.string(),
        delimiter: z.string().nonempty().default(","),
        idColName: z.string().default("id"),
        fullnameColName: z.string().default("fullname"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = parseCSV(input.csvText, {
        comma: input.delimiter as Comma,
        output: "objects",
      });
      const idCol = input.idColName;
      const fullnameCol = input.fullnameColName;

      const schema = z.array(
        z.object({ id: z.string(), fullname: z.string() })
      );

      const mapped = data
        .map((v) => ({
          id: v[idCol],
          fullname: v[fullnameCol],
        }))
        .filter((v) => v.id?.trim().length && v.fullname?.trim().length);

      const verified = schema.parse(mapped);
      console.log(verified);

      await delay(1500);

      await ctx.prisma.country.createMany({ data: verified });

      return mapped;
    }),
});
