import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import fetchUrlRoute from "@/backend/trpc/routes/articles/fetch-url/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  articles: createTRPCRouter({
    fetchUrl: fetchUrlRoute,
  }),
});

export type AppRouter = typeof appRouter;
