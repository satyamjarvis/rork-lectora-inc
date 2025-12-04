import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

export const fetchUrlProcedure = publicProcedure
  .input(z.object({ url: z.string().url() }))
  .query(async ({ input }) => {
    try {
      console.log('[Backend] Fetching URL:', input.url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(input.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      console.log(`[Backend] ✅ Fetched ${html.length} characters`);

      return {
        html,
        status: response.status,
        contentType: response.headers.get('content-type'),
      };
    } catch (error: any) {
      console.error('[Backend] ❌ Fetch failed:', error.message);
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  });

export default fetchUrlProcedure;
