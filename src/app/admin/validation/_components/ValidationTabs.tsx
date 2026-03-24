'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle, Eye, RefreshCw, Trash2, XCircle } from 'lucide-react'

import { ValidationResultCard } from '@/components/validation/ValidationResultCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'
import { useDeleteValidation, useValidationDetail, useValidationHistory } from '@/hooks/use-validation'
import { normalizeCitationIssues } from '@/lib/validation-issue-utils'
import type { ValidationDetail, ValidationInspection, ValidationResult } from '@/types/validation.type'

interface ValidationTabsProps {
  conversationId: string
  messageId: string
}

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

export default function ValidationTabs({
  conversationId,
  messageId,
}: ValidationTabsProps) {
  const [selectedValidationId, setSelectedValidationId] = useState<number | null>(null)

  const { data: historyData, isLoading, refetch } = useValidationHistory({
    skip: 0,
    limit: 100,
    message_id: Number(messageId),
  })
  const { data: selectedDetail, isLoading: isLoadingDetail } = useValidationDetail(selectedValidationId)

  const deleteValidationMutation = useDeleteValidation()
  const inspectionResult = selectedDetail ? toInspectionFromDetail(selectedDetail) : null

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this validation?')) {
      await deleteValidationMutation.mutateAsync(id)
      refetch()
      if (selectedValidationId === id) {
        setSelectedValidationId(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">
            Validation List ({historyData?.validations.length || 0})
          </TabsTrigger>
          {inspectionResult && (
            <TabsTrigger value="inspection">
              Inspection Details
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Validation History</CardTitle>
                  <CardDescription>
                    Message {messageId} in conversation {conversationId.slice(0, 8)}...
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : historyData && historyData.validations.length > 0 ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Relevance</TableHead>
                        <TableHead className="text-right">Accuracy</TableHead>
                        <TableHead className="text-right">Citations</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.validations.map((validation) => (
                        <TableRow
                          key={validation.id}
                          className={`cursor-pointer transition-colors ${
                            selectedValidationId === validation.id
                              ? 'bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedValidationId(validation.id)}
                        >
                          <TableCell className="font-medium">
                            {format(new Date(validation.created_at), 'MMM d, HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {validation.model_name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {validation.has_hallucination ? (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Issues
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="gap-1 text-green-600 border-green-600"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Clean
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {((validation.relevance_score ?? 0) * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {((validation.factual_accuracy_score ?? 0) * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {((validation.citation_accuracy ?? 0) * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedValidationId(validation.id)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(validation.id)
                                }}
                                disabled={deleteValidationMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold">No Validations Found</p>
                  <p className="text-sm text-muted-foreground">
                    No validation history for this conversation yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isLoadingDetail ? (
          <TabsContent value="inspection" className="mt-6">
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          </TabsContent>
        ) : null}

        {inspectionResult ? (
          <TabsContent value="inspection" className="mt-6">
            <ValidationResultCard result={inspectionResult} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}
