export interface SJRData {
  journal_title: string;
  issn: string;
  sjr_score: number;
  quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  h_index: number;
  impact_factor: number;
  rank: number;
  percentile: number;
  is_open_access: boolean;
  publisher: string;
  country: string;
  data_year: number;
}

export interface PaperSource {
  paper_id?: string;
  title: string;
  authors?: Author[];
  year?: number;
  venue?: string;
  abstract?: string;
  url?: string;
  pdf_url?: string;
  citation_count?: number;
  source?: string;
  relevance_score?: number;
  sjr_data?: SJRData;
}

export interface Author {
  authorId: string;
  name: string;
  hIndex: number;
  paperCount: number;
  citationCount: number;
}