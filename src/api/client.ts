import type { ApiError } from './contract'

/** 브라우저는 항상 같은 출처의 /api 만 부른다. 절대 주소를 쓰지 않는다. */
const API_BASE = '/api'

/**
 * 백엔드가 아니라 프론트가 만든 오류의 종류.
 * - unreachable: 백엔드에 닿지 못함 (네트워크 오류, 프록시 502·504 등 { error } 본문이 없는 응답)
 * - timeout: 분석이 제한 시간 안에 끝나지 않음
 * - unknown: 그 밖에 예상하지 못한 오류
 */
export type ClientErrorKind = 'unreachable' | 'timeout' | 'unknown'

/** 화면에서 다루는 오류: 백엔드 ApiError, 또는 clientKind가 붙은 프론트 오류 */
export type AppError = ApiError & { clientKind?: ClientErrorKind }

const CLIENT_ERROR_MESSAGES: Record<ClientErrorKind, string> = {
  unreachable: '서버에 연결하지 못했어요.',
  timeout: '분석이 오래 걸리고 있어요.',
  unknown: '알 수 없는 오류가 났어요.',
}

export function clientError(kind: ClientErrorKind): AppError {
  return { code: 'INTERNAL_ERROR', message: CLIENT_ERROR_MESSAGES[kind], retryable: true, clientKind: kind }
}

/** 백엔드가 { error } 로 응답했거나 서버에 닿지 못했을 때 던지는 오류 */
export class ApiRequestError extends Error {
  readonly status: number
  readonly error: AppError

  constructor(status: number, error: AppError) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.status = status
    this.error = error
  }
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
    throw new ApiRequestError(0, clientError('unreachable'))
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isApiErrorBody(payload)) throw new ApiRequestError(response.status, payload.error)
    // 백엔드는 실패하면 항상 { error } 를 준다. 그게 없으면 중간(프록시 등)에서 막힌 것으로 본다
    throw new ApiRequestError(response.status, clientError('unreachable'))
  }

  return payload as T
}
