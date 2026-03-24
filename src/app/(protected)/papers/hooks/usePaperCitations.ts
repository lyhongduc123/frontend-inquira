import { useQuery } from '@tanstack/react-query'
import { papersApi } from '@/lib/api/papers-api'
import { defaultRetry, defaultRetryDelay } from '@/lib/react-query/react-query-utils'

export function usePaperCitations(paperId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['paper', paperId, 'citations'],
    queryFn: () => papersApi.getCitations({ paperId, limit: 100 }),
    enabled: !!paperId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  })
}
