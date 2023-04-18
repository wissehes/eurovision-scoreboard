import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { yearRouter } from "./routers/yearRouter";
import { rankableRouter } from "./routers/rankableRouter";
import { songsRouter } from "./routers/songsRouter";
import { countryRouter } from "./routers/countryRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  years: yearRouter,
  rankable: rankableRouter,
  songs: songsRouter,
  countries: countryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
