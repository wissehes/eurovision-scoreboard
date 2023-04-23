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
      isoCode: z.string().optional(),
    }),

    songs: z.array(
      z.object({
        artist: z.string(),
        songTitle: z.string(),
        youtubeURL: z.string(),
        previewURL: z.string().optional(),
        artworkURL: z.string().optional(),
        year: z.number(),
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
      include: { items: { include: { groups: true } } },
    });

    const mappedData: ExportedJSONData = data.map((c) => ({
      country: { id: c.id, fullname: c.fullname, isoCode: c.isoCode },
      songs: c.items.map((s) => ({
        artist: s.artist,
        songTitle: s.title,
        youtubeURL: s.youtubeURL,
        previewURL: s.previewURL ?? undefined,
        artworkURL: s.artworkURL ?? undefined,
        year: s.groups[0]?.yearId ?? 0,
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

      await delay(1500);

      await ctx.prisma.country.createMany({ data: verified });

      return mapped;
    }),

  importFromJSON: adminProcedure
    .input(z.object({ json: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Parse and validate the JSON against the zod schema
      const parsed: unknown = JSON.parse(input.json);
      const importData = exportedJSONData.parse(parsed);

      // A simple type for a song with a country id
      // instead of a country with multiple songs
      type SongWithCountryID = {
        songTitle: string;
        artist: string;
        youtubeURL: string;
        previewURL?: string;
        artworkURL?: string;
        countryId: string;
      };

      // Create a map where the Key = year and Value = SongWithCountryID[]
      const songsWithCountryByYear = new Map<number, SongWithCountryID[]>();

      // For every country loop over its songs
      for (const item of importData) {
        // For every song, get the current songs for that year, or an empty array
        // then add a song to that array (with a countryId)
        // And then set those songs to the year in the Map
        for (const song of item.songs) {
          const yearItems = songsWithCountryByYear.get(song.year) ?? [];
          const songFormatted: SongWithCountryID = {
            countryId: item.country.id,
            ...song,
          };
          songsWithCountryByYear.set(song.year, [songFormatted, ...yearItems]);
        }
      }

      // Add all countries to the db, if they don't yet exist
      const createCountries = ctx.prisma.country.createMany({
        data: importData.map((c) => c.country),
        skipDuplicates: true,
      });

      // For every year, create a group called "All songs"
      const createAllSongsGroups = Array.from(songsWithCountryByYear).map(
        ([year, songs]) => {
          return ctx.prisma.eurovisionGroup.create({
            data: {
              name: "All Songs",
              year: {
                connectOrCreate: {
                  create: { year },
                  where: { year },
                },
              },
              type: "ALL_SONGS",
              items: {
                create: songs.map((s) => ({
                  artist: s.artist,
                  title: s.songTitle,
                  youtubeURL: s.youtubeURL,
                  previewURL: s.previewURL,
                  artworkURL: s.artworkURL,
                  countryId: s.countryId,
                })),
              },
            },
          });
        }
      );

      await delay(250);
      return ctx.prisma.$transaction([
        createCountries,
        ...createAllSongsGroups,
      ]);
    }),
});
