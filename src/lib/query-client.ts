import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({ defaultOptions: {
    queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false, refetchOnMount: false },
    mutations: { retry: false },
  } });
}
let browserClient: QueryClient | undefined;
export function getQueryClient() {
  if (typeof window === "undefined") return createQueryClient();
  return browserClient ??= createQueryClient();
}
