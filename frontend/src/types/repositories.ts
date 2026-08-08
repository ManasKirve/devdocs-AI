export interface IngestRequest {
  repository_url: string
}

export interface DocumentMetadata {
  repository: string
  file_path: string
  file_name: string
  language: string
  size: number
  content_preview: string
}

export interface IngestResponse {
  repository: string
  files_processed: number
  files_skipped: number
  chunks_created: number
  embeddings_created: number
  documents: DocumentMetadata[]
}
