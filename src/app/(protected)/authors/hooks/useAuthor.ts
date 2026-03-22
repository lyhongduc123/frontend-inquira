import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authorApi, type AuthorListParams, type AuthorCreateRequest, type AuthorUpdateRequest } from '@/lib/api/author-api'
import { defaultRetry, defaultRetryDelay, handleMutationError, handleMutationSuccess } from '@/lib/utils/react-query-utils'

/**
 * Fetch a single author by ID
 */
export function useAuthor(authorId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['author', authorId],
    queryFn: () => authorApi.getDetails(authorId),
    enabled: !!authorId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  })
}

/**
 * Fetch author details with papers, co-authors, and metrics
 */
export function useAuthorDetails(authorId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['author', authorId, 'details'],
    queryFn: () => authorApi.getDetails(authorId),
    enabled: !!authorId && enabled,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false

      const status = data.enrichmentStatus?.status
      const hasTerminalStatus = status === 'completed' || status === 'failed'
      const isEnriching = status === 'enriching'
      const isFirstProcessing =
        !hasTerminalStatus &&
        data.isProcessed === false &&
        data.isEnriched === false

      return isEnriching || isFirstProcessing ? 3000 : false
    },
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  })
}

/**
 * Fetch paginated list of authors
 */
export function useAuthors(params: AuthorListParams = {}) {
  return useQuery({
    queryKey: ['authors', params],
    queryFn: () => authorApi.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  })
}

/**
 * Fetch author statistics
 */
export function useAuthorStats() {
  return useQuery({
    queryKey: ['authors', 'stats'],
    queryFn: () => authorApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: defaultRetry,
    retryDelay: defaultRetryDelay,
  })
}

/**
 * Create a new author
 */
export function useCreateAuthor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AuthorCreateRequest) => authorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      handleMutationSuccess('Author created successfully')
    },
    onError: (error) => {
      handleMutationError(error, 'create author')
    },
  })
}

/**
 * Update an author
 */
export function useUpdateAuthor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ authorId, data }: { authorId: string; data: AuthorUpdateRequest }) =>
      authorApi.update(authorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['author', variables.authorId] })
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      handleMutationSuccess('Author updated successfully')
    },
    onError: (error) => {
      handleMutationError(error, 'update author')
    },
  })
}

/**
 * Delete an author
 */
export function useDeleteAuthor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (authorId: string) => authorApi.delete(authorId),
    onSuccess: (_, authorId) => {
      queryClient.removeQueries({ queryKey: ['author', authorId] })
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      handleMutationSuccess('Author deleted successfully')
    },
    onError: (error) => {
      handleMutationError(error, 'delete author')
    },
  })
}
