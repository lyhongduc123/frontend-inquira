'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle, History, MessageSquare, Play, TestTube, Trash2, XCircle } from 'lucide-react'

import { ValidationResultCard } from '@/components/validation/ValidationResultCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useConversations } from '@/hooks/use-conversations'
import {
  useDeleteValidation,
  useValidation,
  useValidationDetail,
  useValidationHistory,
  useValidationStats,
} from '@/hooks/use-validation'
import type { Conversation, Message } from '@/types/conversation.type'
import type {
  ValidationDetail,
  ValidationInspection,
  ValidationRequest,
  ValidationResult,
} from '@/types/validation.type'
import { normalizeCitationIssues } from '@/lib/validation/validation-issue-utils'

function toInspectionFromDetail(detail: ValidationDetail): ValidationInspection {
  const citationIssues = normalizeCitationIssues(detail.incorrect_citations)

  const result: ValidationResult = {
    query: detail.query_text,
    generated_answer: detail.generated_answer ?? '',
    context_used: detail.context_used ?? '',
    text_match: {
      matched_terms: [],
      missing_terms: [],
      match_percentage: 0,
      suspicious_sentences: [],
    },
    context_evidence: detail.context_evidence ?? {
      paper_ids: [],
      chunk_ids: [],
      total_papers: 0,
      total_chunks: 0,
    },
    has_hallucination: detail.has_hallucination,
    hallucination_count: detail.hallucination_count,
    hallucination_details: detail.hallucination_details,
    non_existent_facts: detail.non_existent_facts,
    incorrect_citations: citationIssues,
    citation_accuracy: {
      total_citations: detail.total_citations,
      correct_citations: detail.correct_citations,
      hallucinated_citations: detail.hallucinated_citations,
      missing_citations: detail.missing_citations,
      accuracy: detail.citation_accuracy ?? 0,
    },
    relevance_score: detail.relevance_score ?? 0,
    factual_accuracy_score: detail.factual_accuracy_score ?? 0,
    component_scores:
      detail.component_scores ?? {
        grounding_score: detail.factual_accuracy_score ?? 0,
        citation_faithfulness_score: detail.citation_accuracy ?? 0,
        relevance_score: detail.relevance_score ?? 0,
        perspective_coverage_score: 0,
        overall_score: detail.factual_accuracy_score ?? 0,
      },
    claims_checked: [],
    execution_time_ms: detail.execution_time_ms ?? 0,
    model_used: detail.model_name ?? 'unknown',
    validation_id: detail.id,
  }

  return {
    validation_id: detail.id,
    timestamp: detail.created_at,
    result,
    summary: {
      has_issues: detail.has_hallucination || detail.hallucinated_citations > 0,
      text_match_percentage: 0,
      citation_accuracy: detail.citation_accuracy ?? 0,
      relevance: detail.relevance_score ?? 0,
      issues_count: detail.hallucination_count + detail.hallucinated_citations,
      overall_score: result.component_scores.overall_score,
      grounding_score: result.component_scores.grounding_score,
      perspective_coverage_score: result.component_scores.perspective_coverage_score,
    },
  }
}

function getPreviousUserQuery(conversation: Conversation | null, message: Message | null): string {
  if (!conversation || !message) return ''
  const messageIndex = conversation.messages.findIndex((item) => item.id === message.id)
  if (messageIndex <= 0) return ''

  for (let index = messageIndex - 1; index >= 0; index -= 1) {
    if (conversation.messages[index].role === 'user') {
      return conversation.messages[index].content
    }
  }

  return ''
}

export default function ValidationPage() {
  const [query, setQuery] = useState('')
  const [context, setContext] = useState('')
  const [generatedAnswer, setGeneratedAnswer] = useState('')
  const [modelName, setModelName] = useState('gpt-4o-mini')

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)

  const validationMutation = useValidation()
  const deleteValidationMutation = useDeleteValidation()
  const { data: stats } = useValidationStats()
  const { data: historyData, isLoading: loadingHistory, refetch: refetchHistory } =
    useValidationHistory({ skip: 0, limit: 100 })
  const { data: detailData, isLoading: loadingDetail } = useValidationDetail(selectedHistoryId)
  const { conversations, isLoading: loadingConversations } = useConversations({
    page: 1,
    pageSize: 100,
  })

  const manualResult = validationMutation.data ?? null
  const selectedHistoryInspection = useMemo(() => {
    if (!detailData) return null
    return toInspectionFromDetail(detailData)
  }, [detailData])

  const buildConversationContext = (message: Message): string => {
    const paperSnapshots = message.paperSnapshots ?? []
    const paperIds = paperSnapshots.map((paper) => paper.paperId)

    const chunkIds = paperSnapshots.flatMap((paper) => {
      const dynamicPaper = paper as unknown as Record<string, unknown>
      const chunks = dynamicPaper.chunks
      if (!Array.isArray(chunks)) return []
      return chunks
        .map((chunk) => {
          if (typeof chunk === 'string') return chunk
          if (chunk && typeof chunk === 'object' && 'chunkId' in chunk) {
            return String((chunk as { chunkId: unknown }).chunkId)
          }
          return null
        })
        .filter((chunkId): chunkId is string => chunkId !== null)
    })

    return JSON.stringify(
      {
        query: getPreviousUserQuery(selectedConversation, message),
        paper_ids: paperIds,
        chunk_ids: chunkIds,
        paper_snapshots: paperSnapshots,
      },
      null,
      2
    )
  }

  const runManualValidation = async (): Promise<void> => {
    const payload: ValidationRequest = {
      query,
      context,
      generated_answer: generatedAnswer || undefined,
      model_name: modelName,
    }
    await validationMutation.mutateAsync(payload)
  }

  const runMessageValidation = async (): Promise<void> => {
    if (!selectedMessage) return
    const payload: ValidationRequest = {
      query: getPreviousUserQuery(selectedConversation, selectedMessage) || 'Conversation query',
      context: buildConversationContext(selectedMessage),
      generated_answer: selectedMessage.content,
      model_name: modelName,
      conversation_id: selectedConversation ? Number(selectedConversation.id) : undefined,
      message_id: selectedMessage.id,
    }
    await validationMutation.mutateAsync(payload)
    refetchHistory()
  }

  const removeValidation = async (validationId: number): Promise<void> => {
    if (!confirm('Delete this validation record?')) return
    await deleteValidationMutation.mutateAsync(validationId)
    if (selectedHistoryId === validationId) {
      setSelectedHistoryId(null)
    }
    refetchHistory()
  }

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Validation Workbench</h1>
        <p className="text-muted-foreground">
          Per-query verification for relevance, grounding, citations, papers, and chunks
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatsCard label="Total" value={stats.total_validations} icon={<TestTube className="h-4 w-4" />} />
          <StatsCard
            label="Hallucination Rate"
            value={`${(stats.hallucination_rate * 100).toFixed(1)}%`}
            icon={<XCircle className="h-4 w-4" />}
          />
          <StatsCard
            label="Avg Relevance"
            value={`${(stats.average_relevance_score * 100).toFixed(1)}%`}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatsCard
            label="Avg Grounding"
            value={`${((stats.average_grounding_score ?? 0) * 100).toFixed(1)}%`}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatsCard
            label="Avg Perspective"
            value={`${((stats.average_perspective_coverage ?? 0) * 100).toFixed(1)}%`}
            icon={<History className="h-4 w-4" />}
          />
        </div>
      )}

      <Tabs defaultValue="conversation" className="w-full">
        <TabsList>
          <TabsTrigger value="conversation" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <TestTube className="h-4 w-4" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Per-query History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversation" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Select conversation</CardTitle>
                <CardDescription>Pick a conversation and then an assistant message</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingConversations ? (
                  <div className="flex justify-center py-10">
                    <Spinner className="h-7 w-7" />
                  </div>
                ) : (
                  <ScrollArea className="h-[420px]">
                    <div className="space-y-2">
                      {conversations.map((item: Conversation) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedConversation(item)
                            setSelectedMessage(null)
                          }}
                          className="w-full rounded-lg border p-3 text-left hover:bg-accent"
                        >
                          <p className="line-clamp-1 font-medium">{item.title || 'Untitled conversation'}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.messageCount} messages · {format(new Date(item.updatedAt), 'yyyy-MM-dd HH:mm')}
                          </p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Select assistant answer</CardTitle>
                <CardDescription>Each validation is tracked per query and message</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <ScrollArea className="h-[420px]">
                    <div className="space-y-2">
                      {selectedConversation.messages
                        .filter((item) => item.role === 'assistant')
                        .map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedMessage(item)}
                            className="w-full rounded-lg border p-3 text-left hover:bg-accent"
                          >
                            <p className="line-clamp-2 text-sm">{item.content}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')} · papers:{' '}
                              {item.paperSnapshots?.length ?? 0}
                            </p>
                          </button>
                        ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a conversation first</p>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedMessage && (
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Run validation for selected message</CardTitle>
                <CardDescription>
                  Query, paper IDs and chunk IDs are captured for per-query verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Conversation title</Label>
                    <Input value={selectedConversation?.title || 'Untitled conversation'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Validation model</Label>
                    <Select value={modelName} onValueChange={setModelName}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={runMessageValidation} disabled={validationMutation.isPending} className="gap-2">
                  {validationMutation.isPending ? <Spinner className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  Validate selected answer
                </Button>
              </CardContent>
            </Card>
          )}

          {manualResult && <ValidationResultCard result={manualResult} />}
        </TabsContent>

        <TabsContent value="manual" className="mt-6 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Manual validation</CardTitle>
              <CardDescription>Paste query, context, and answer to test validation v2</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">Original query</Label>
                <Textarea id="query" value={query} onChange={(event) => setQuery(event.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Context input (papers + chunks)</Label>
                <Textarea
                  id="context"
                  className="font-mono text-xs"
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  rows={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Generated answer (optional)</Label>
                <Textarea
                  id="answer"
                  value={generatedAnswer}
                  onChange={(event) => setGeneratedAnswer(event.target.value)}
                  rows={6}
                />
              </div>
              <Button onClick={runManualValidation} disabled={!query || !context || validationMutation.isPending}>
                {validationMutation.isPending ? 'Running…' : 'Run validation'}
              </Button>
            </CardContent>
          </Card>

          {manualResult && <ValidationResultCard result={manualResult} />}
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Per-query validation history</CardTitle>
              <CardDescription>
                Open a row to inspect original query, metrics, papers, and input chunks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex justify-center py-10">
                  <Spinner className="h-7 w-7" />
                </div>
              ) : (
                <div className="space-y-3">
                  {historyData?.validations.map((item) => (
                    <div key={item.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{item.query_text}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss')} · model: {item.model_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.has_hallucination ? (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Issues
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 border-green-600 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Clean
                            </Badge>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setSelectedHistoryId(item.id)}>
                            Open
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeValidation(item.id)}
                            disabled={deleteValidationMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-6">
                        <MetricChip label="Relevance" value={`${((item.relevance_score ?? 0) * 100).toFixed(1)}%`} />
                        <MetricChip
                          label="Factual"
                          value={`${((item.factual_accuracy_score ?? 0) * 100).toFixed(1)}%`}
                        />
                        <MetricChip
                          label="Citations"
                          value={`${((item.citation_accuracy ?? 0) * 100).toFixed(1)}%`}
                        />
                        <MetricChip label="Paper IDs" value={item.context_evidence?.total_papers ?? 0} />
                        <MetricChip label="Chunk IDs" value={item.context_evidence?.total_chunks ?? 0} />
                        <MetricChip label="Exec (ms)" value={item.execution_time_ms ?? 0} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {loadingDetail && (
            <div className="flex justify-center py-4">
              <Spinner className="h-6 w-6" />
            </div>
          )}

          {selectedHistoryInspection && <ValidationResultCard result={selectedHistoryInspection} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-5">
        <div className="mb-1 flex items-center justify-between text-muted-foreground">
          <span className="text-xs">{label}</span>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function MetricChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border bg-muted/40 p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
