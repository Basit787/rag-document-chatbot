import { QueryCache, QueryClient } from '@tanstack/react-query';
import { showErrorToast } from '#/hooks/useToast';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => showErrorToast(error.message),
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
