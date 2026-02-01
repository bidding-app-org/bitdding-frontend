const DEFAULT_BASE = 'http://localhost:8080'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_BASE

export function uploadsUrl(filename: string | null | undefined): string | null {
  if (!filename) return null
  return `${API_BASE_URL}/uploads/${encodeURIComponent(filename)}`
}

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function parseErrorBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const details = await parseErrorBody(res)
    const message =
      (typeof details === 'object' && details && 'message' in (details as any) && (details as any).message) ||
      res.statusText ||
      'Request failed'
    throw new ApiError(String(message), res.status, details)
  }

  if (res.status === 204 || res.status === 205) {
    return undefined as T
  }

  const contentType = res.headers.get('content-type') ?? ''
  const text = await res.text()
  if (!text) return undefined as T

  if (contentType.includes('application/json')) {
    return JSON.parse(text) as T
  }

  // Some endpoints may return plain text on success.
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}
