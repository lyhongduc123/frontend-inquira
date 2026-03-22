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

export type ValidationCitationIssueType =
  | 'citation_out_of_range'
  | 'citation_not_found'
  | 'fact_not_supported'
  | 'misinterpreted_citation'
  | 'unknown'

export interface ValidationCitationIssue {
  citation: string
  reason: string
  expected_range?: string
  type?: ValidationCitationIssueType
}

export interface ContextEvidence {
  paper_ids: string[]
  chunk_ids: string[]
  total_papers: number
  total_chunks: number
}

export interface ValidationClaim {
  claim: string
  support_score: number
  supported: boolean
  missing_terms: string[]
}

export interface ValidationComponentScores {
  grounding_score: number
  citation_faithfulness_score: number
  relevance_score: number
  perspective_coverage_score: number
  overall_score: number
}

/**
 * Detailed validation result
 */
export interface ValidationResult {
  query: string
  generated_answer: string
  context_used: string
  text_match: TextMatchAnalysis
  context_evidence: ContextEvidence
  has_hallucination: boolean
  hallucination_count: number
  hallucination_details?: string[] | null
  non_existent_facts?: string[] | null
  incorrect_citations?: ValidationCitationIssue[] | null
  citation_accuracy?: CitationAccuracy | null
  relevance_score: number
  factual_accuracy_score: number
  component_scores: ValidationComponentScores
  claims_checked: ValidationClaim[]
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
    overall_score?: number
    grounding_score?: number
    perspective_coverage_score?: number
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
  conversation_id?: number | null
  message_id?: number | null
}

/**
 * Validation history item
 */
export interface ValidationHistoryItem {
  id: number
  query_text: string
  model_name: string
  message_id?: number | null
  has_hallucination: boolean
  factual_accuracy_score?: number | null
  relevance_score?: number | null
  citation_accuracy?: number | null
  execution_time_ms?: number | null
  total_citations: number
  correct_citations: number
  hallucinated_citations: number
  missing_citations: number
  context_evidence?: ContextEvidence | null
  created_at: string
  validated_at?: string | null
}

export interface ValidationDetail {
  id: number
  message_id?: number | null
  query_text: string
  generated_answer?: string | null
  context_used?: string | null
  context_evidence?: ContextEvidence | null
  has_hallucination: boolean
  hallucination_count: number
  hallucination_details?: string[] | null
  non_existent_facts?: string[] | null
  incorrect_citations?: ValidationCitationIssue[] | null
  relevance_score?: number | null
  factual_accuracy_score?: number | null
  citation_accuracy?: number | null
  total_citations: number
  correct_citations: number
  hallucinated_citations: number
  missing_citations: number
  execution_time_ms?: number | null
  model_name?: string | null
  status: string
  component_scores?: ValidationComponentScores | null
  created_at: string
  validated_at?: string | null
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
  average_grounding_score?: number
  average_perspective_coverage?: number
  conversation_id?: number | null
  model_name?: string | null
}

/**
 * Paper snapshot with context for validation
 */
export interface PaperSnapshot extends PaperMetadata {
  chunks?: string[]
  relevance_score?: number
}
