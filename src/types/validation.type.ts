import { PaperMetadata } from './paper.type'

/**
 * Text matching analysis for frontend diff display
 */
export interface TextMatchAnalysis {
  matched_terms: string[]
  missing_terms: string[]
  match_percentage: number
  suspicious_sentences: string[]
}

/**
 * Citation accuracy metrics
 */
export interface CitationAccuracy {
  total_citations: number
  correct_citations: number
  hallucinated_citations: number
  missing_citations: number
  accuracy: number
}

/**
 * Detailed validation result
 */
export interface ValidationResult {
  query: string
  generated_answer: string
  context_used: string
  text_match: TextMatchAnalysis
  has_hallucination: boolean
  hallucination_count: number
  hallucination_details?: string[] | null
  non_existent_facts?: string[] | null
  incorrect_citations?: Array<{
    citation: string
    reason: string
    expected_range?: string
  }> | null
  citation_accuracy?: CitationAccuracy | null
  relevance_score: number
  factual_accuracy_score: number
  execution_time_ms: number
  model_used: string
  validation_id?: number | null
}

/**
 * Complete validation inspection response
 */
export interface ValidationInspection {
  validation_id: number
  timestamp: string
  result: ValidationResult
  summary: {
    has_issues: boolean
    text_match_percentage: number
    citation_accuracy: number
    relevance: number
    issues_count: number
  }
}

/**
 * Validation request payload
 */
export interface ValidationRequest {
  query: string
  context: string
  generated_answer?: string | null
  model_name?: string
  conversation_id?: string | null
  message_id?: string | null
}

/**
 * Validation history item
 */
export interface ValidationHistoryItem {
  id: number
  query_text: string
  context_text: string
  generated_answer: string
  model_name: string
  conversation_id?: string | null
  message_id?: string | null
  has_hallucination: boolean
  hallucination_count: number
  hallucination_details?: string[] | null
  non_existent_facts?: string[] | null
  incorrect_citations?: Array<Record<string, unknown>> | null
  total_citations: number
  correct_citations: number
  hallucinated_citations: number
  missing_citations: number
  relevance_score: number
  factual_accuracy_score: number
  citation_accuracy: number
  execution_time_ms: number
  created_at: string
  updated_at: string
}

/**
 * Validation history response
 */
export interface ValidationHistoryResponse {
  total: number
  skip: number
  limit: number
  validations: ValidationHistoryItem[]
}

/**
 * Validation statistics
 */
export interface ValidationStats {
  total_validations: number
  hallucination_rate: number
  average_relevance_score: number
  average_factual_accuracy: number
  average_citation_accuracy: number
  total_hallucinations: number
  total_incorrect_citations: number
  conversation_id?: string | null
  model_name?: string | null
}

/**
 * Paper snapshot with context for validation
 */
export interface PaperSnapshot extends PaperMetadata {
  chunks?: string[]
  relevance_score?: number
}
