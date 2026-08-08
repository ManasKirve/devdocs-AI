export interface GenerateRequest {
  prompt: string
  temperature?: number
  max_tokens?: number
}

export interface GenerateResponse {
  response: string
}
