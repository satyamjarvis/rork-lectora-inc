import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const rawBaseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL?.trim();

if (!rawBaseUrl) {
  console.warn(
    "⚠️ EXPO_PUBLIC_RORK_API_BASE_URL no está configurada. Las funciones que dependen del backend remoto estarán limitadas hasta que agregues esta variable al build."
  );
}

const sanitizedBaseUrl = rawBaseUrl?.replace(/\/+$/, "") ?? "https://offline-placeholder.rork.app";

export const trpcConfig = {
  baseUrl: rawBaseUrl ?? null,
  isConfigured: Boolean(rawBaseUrl),
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${sanitizedBaseUrl}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
