import { API_BASE_URL } from '../config'
import { readErrorMessage } from './http'
import type { SearchRequest, SearchResponse } from '../types/search'

export async function searchCodebase(request: SearchRequest): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as SearchResponse
}
