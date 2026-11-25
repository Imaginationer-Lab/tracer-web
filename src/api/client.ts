import type { ApiError } from './contract'

/** 브라우저는 항상 같은 출처의 /api 만 부른다. 절대 주소를 쓰지 않는다. */
const API_BASE = '/api'

/** 백엔드가 { error } 로 응답했거나 서버에 닿지 못했을 때 던지는 오류 */
export class ApiRequestError extends Error {
  readonly status: number
  readonly error: ApiError

  constructor(status: number, error: ApiError) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.status = status
    this.error = error
  }
}

const NETWORK_ERROR: ApiError = {
  code: 'INTERNAL_ERROR',
  message: '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',
  retryable: true,
}

function isApiErrorBody(body: unknown): body is { error: ApiError } {
  if (typeof body !== 'object' || body === null || !('error' in body)) return false
  const error = (body as { error: unknown }).error
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
}

/** /api 아래 경로를 부르고 JSON 본문을 돌려준다. 실패하면 ApiRequestError를 던진다. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new ApiRequestError(0, NETWORK_ERROR)
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isApiErrorBody(payload)) throw new ApiRequestError(response.status, payload.error)
    throw new ApiRequestError(response.status, {
      code: 'INTERNAL_ERROR',
      message: '일시적인 서버 오류가 났어요. 잠시 후 다시 시도해 주세요.',
      retryable: true,
    })
  }

  return payload as T
}
