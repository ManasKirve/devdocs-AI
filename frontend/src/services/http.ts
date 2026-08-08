const BACKEND_OFFLINE_MESSAGE =
  'Cannot reach the backend. Please make sure the DevDocs AI server is running and try again.'

export async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (typeof body.detail === 'string') {
      return body.detail
    }
  } catch {}
  return `Request failed with status ${response.status}`
}

export function getFriendlyError(error: unknown): string {
  if (error instanceof TypeError) {
    return BACKEND_OFFLINE_MESSAGE
  }
  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') {
      return BACKEND_OFFLINE_MESSAGE
    }
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
