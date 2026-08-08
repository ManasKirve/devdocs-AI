import { API_BASE_URL } from '../config'
import type { GenerateRequest, GenerateResponse } from '../types/ai'

export async function generateResponse(prompt: string): Promise<GenerateResponse> {
  const request: GenerateRequest = { prompt }
  const response = await fetch(`${API_BASE_URL}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as GenerateResponse
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
