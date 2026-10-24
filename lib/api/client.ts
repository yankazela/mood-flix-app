import { getRequest, patchRequest, postRequest } from '@/app/api/requests'
import { MOOD_API_URL } from '@/app/api/requests/types'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

type QueryValue = string | number | boolean | string[] | undefined

function withQuery(path: string, query?: Record<string, QueryValue>): string {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.join(','))
    } else {
      params.set(key, String(value))
    }
  }
  const text = params.toString()
  return text ? `${path}?${text}` : path
}

/** Authenticated calls to the MoodFlix API; each resolves to the response body. */
export async function apiGet<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
  const response = await getRequest<T>({ path: withQuery(path, query), auth: true, headers: JSON_HEADERS }, MOOD_API_URL)
  return response.data
}

export async function apiPost<T>(path: string, data: unknown, timeout?: number): Promise<T> {
  const response = await postRequest<T>({ path, auth: true, headers: JSON_HEADERS, data, timeout }, MOOD_API_URL)
  return response.data
}

export async function apiPatch<T>(path: string, data: unknown): Promise<T> {
  const response = await patchRequest<T>({ path, auth: true, headers: JSON_HEADERS, data }, MOOD_API_URL)
  return response.data
}
