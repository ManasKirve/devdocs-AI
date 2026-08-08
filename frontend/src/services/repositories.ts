import { API_BASE_URL } from '../config'
import type { IngestRequest, IngestResponse } from '../types/repositories'

export async function ingestRepository(url: string): Promise<IngestResponse> {
  const request: IngestRequest = { repository_url: url }
  const response = await fetch(`${API_BASE_URL}/api/v1/repositories/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as IngestResponse
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (typeof body.detail === 'string') {
      return body.detail
    }
  } catch {}
  return `Request failed with status ${response.status}`
}
