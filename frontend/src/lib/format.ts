export function formatScore(score: number): string {
  const clamped = Math.max(0, Math.min(1, score))
  return `${Math.round(clamped * 100)}%`
}

export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

export function splitPath(path: string): { directory: string; basename: string } {
  const index = path.lastIndexOf('/')
  if (index === -1) return { directory: '', basename: path }
  return { directory: path.slice(0, index + 1), basename: path.slice(index + 1) }
}

export function gitHubSourceUrl(
  repository: string | null,
  filePath: string,
  startLine?: number,
  endLine?: number,
): string {
  if (!repository) return 'https://github.com'
  const path = filePath.replace(/^\/+/, '')
  let url = `https://github.com/${repository}/blob/HEAD/${path}`
  if (typeof startLine === 'number') {
    url += `#L${startLine}`
    if (typeof endLine === 'number' && endLine !== startLine) {
      url += `-L${endLine}`
    }
  }
  return url
}
