import { useQuery } from '@tanstack/react-query'
import { papersApi } from '@/lib/api/papers-api'
import { defaultRetry, defaultRetryDelay } from '@/lib/utils/react-query-utils'

export function usePaperDetail(paperId: string) {
  return useQuery({
    queryKey: ['paper', paperId],
    queryFn: () => papersApi.get(paperId),
    enabled: !!paperId,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  })
}
