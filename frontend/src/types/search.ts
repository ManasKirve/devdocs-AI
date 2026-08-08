export interface SearchRequest {
  query: string
  top_k?: number
  repository?: string
}

export interface SearchResultItem {
  file_path: string
  language: string
  chunk_index: number
  start_line: number
  end_line: number
  content: string
  score: number
}

export interface SearchResponse {
  query: string
  results: SearchResultItem[]
}
