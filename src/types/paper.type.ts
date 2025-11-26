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
}

export interface Author {
  authorId: string;
  name: string;
  hIndex: number;
  paperCount: number;
  citationCount: number;
}