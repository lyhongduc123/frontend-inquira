import { useQuery } from '@tanstack/react-query'
import { papersApi } from '@/lib/api/papers-api'

export function usePaperReferences(paperId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['paper', paperId, 'references'],
    queryFn: () => papersApi.getReferences({ paperId, limit: 100 }),
    enabled: !!paperId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}
