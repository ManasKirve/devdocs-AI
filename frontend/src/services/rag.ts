import { API_BASE_URL } from '../config'
import { readErrorMessage } from './http'
import type { RAGRequest, RAGResponse } from '../types/rag'

export async function askRag(request: RAGRequest): Promise<RAGResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/rag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as RAGResponse
}
