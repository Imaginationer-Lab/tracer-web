import { useCallback, useEffect, useRef, useState } from 'react'
import { getProviderAlternatives } from '../api/analyses'
import { ApiRequestError, clientError, type AppError } from '../api/client'
import type { ProviderAlternatives, ProviderId } from '../api/contract'

export type AlternativesLoad =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'loaded'; data: ProviderAlternatives }
  | { phase: 'error'; error: AppError }

const IDLE: AlternativesLoad = { phase: 'idle' }
const UNKNOWN_ERROR = clientError('unknown')

/**
 * 선택한 서비스의 대체 서비스 (AI 제안). start()를 불렀을 때만 요청한다.
 * 결과는 분석·서비스별로 기억해서, 다른 서비스를 보다 돌아와도 다시 부르지 않는다.
 * 다른 서비스로 바꿔도 진행 중인 요청은 끝까지 받아 둔다 (처음 만들 때 몇 초 걸린다).
 */
export function useProviderAlternatives(analysisId: string, providerId: ProviderId | undefined) {
  const [loads, setLoads] = useState<Record<string, AlternativesLoad>>({})
  const controllersRef = useRef(new Map<string, AbortController>())
  const key = providerId ? `${analysisId}/${providerId}` : ''

  useEffect(() => {
    const controllers = controllersRef.current
    return () => {
      for (const controller of controllers.values()) controller.abort()
      controllers.clear()
    }
  }, [])

  const start = useCallback(() => {
    if (!providerId) return
    controllersRef.current.get(key)?.abort()
    const controller = new AbortController()
    controllersRef.current.set(key, controller)
    const set = (value: AlternativesLoad) => setLoads((prev) => ({ ...prev, [key]: value }))

    set({ phase: 'loading' })
    getProviderAlternatives(analysisId, providerId, controller.signal).then(
      (data) => set({ phase: 'loaded', data }),
      (cause: unknown) => {
        if (controller.signal.aborted) return
        set({ phase: 'error', error: cause instanceof ApiRequestError ? cause.error : UNKNOWN_ERROR })
      },
    )
  }, [analysisId, providerId, key])

  const load = (key && loads[key]) || IDLE
  return { load, start }
}
