import { createTRPCRouter } from "~/server/api/trpc";
import { yearRouter } from "./routers/yearRouter";
import { groupRouter } from "./routers/groupRouter";
import { songsRouter } from "./routers/songsRouter";
import { countryRouter } from "./routers/countryRouter";
import { usersRouter } from "./routers/usersRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  years: yearRouter,
  group: groupRouter,
  songs: songsRouter,
  countries: countryRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
