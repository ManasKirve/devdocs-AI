export interface RAGRequest {
  query: string
  top_k?: number
  repository?: string
}

export interface RAGSource {
  file_path: string
  language: string
  chunk_index: number
  start_line: number
  end_line: number
  score: number
}

export interface RAGResponse {
  query: string
  answer: string
  format: string
  sources: RAGSource[]
}
