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

const exportedJSONData = z.array(
  z.object({
    country: z.object({
      id: z.string(),
      fullname: z.string(),
    }),

    songs: z.array(
      z.object({
        artist: z.string(),
        songTitle: z.string(),
        youtubeURL: z.string(),
      })
    ),
  })
);

type ExportedJSONData = z.infer<typeof exportedJSONData>;

export const countryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.country.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { id: "asc" },
    });
  }),

  getExportJSON: adminProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.country.findMany({
      include: { items: true },
    });

    const mappedData: ExportedJSONData = data.map((c) => ({
      country: { id: c.id, fullname: c.fullname },
      songs: c.items.map((s) => ({
        artist: s.artist,
        songTitle: s.title,
        youtubeURL: s.youtubeURL,
      })),
    }));

    return {
      json: JSON.stringify(mappedData),
    };
  }),

  getAvailableCountries: publicProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const countries = await ctx.prisma.country.findMany({
        include: { _count: { select: { items: true } } },
        orderBy: { id: "asc" },
      });
      const group = await ctx.prisma.eurovisionGroup.findUnique({
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

  importFromJSON: adminProcedure
    .input(z.object({ json: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const parsed: unknown = JSON.parse(input.json);
      const importData = exportedJSONData.parse(parsed);

      const songsWithCountry: {
        songTitle: string;
        artist: string;
        youtubeURL: string;
        countryId: string;
      }[] = [];

      for (const country of importData) {
        for (const song of country.songs) {
          songsWithCountry.push({
            countryId: country.country.id,
            ...song,
          });
        }
      }

      const createCountries = ctx.prisma.country.createMany({
        data: importData.map((c) => c.country),
        skipDuplicates: true,
      });

      const createSongs = ctx.prisma.songItem.createMany({
        data: songsWithCountry.map((s) => ({
          artist: s.artist,
          title: s.songTitle,
          youtubeURL: s.youtubeURL,
          countryId: s.countryId,
        })),
      });

      await delay(250);
      return ctx.prisma.$transaction([createCountries, createSongs]);
    }),
});
