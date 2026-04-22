import { QueryClient } from "@tanstack/react-query";
import { config } from "@/core/config";

/** The single QueryClient instance. CI greps for `new QueryClient(` and fails
 * if there are multiple.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.QUERY_STALE_TIME_MS,
      gcTime: config.QUERY_GC_TIME_MS,
      retry: config.QUERY_RETRY,
      refetchOnWindowFocus: config.QUERY_REFETCH_ON_WINDOW_FOCUS
    },
    mutations: {
      retry: 0
    }
  }
});
