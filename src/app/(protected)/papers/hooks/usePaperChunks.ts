import { useQuery } from '@tanstack/react-query'
import { papersApi } from '@/lib/api/papers-api'

export function usePaperChunks(paperId: string) {
  return useQuery({
    queryKey: ['paper-chunks', paperId],
    queryFn: () => papersApi.getChunks(paperId),
    enabled: !!paperId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}
