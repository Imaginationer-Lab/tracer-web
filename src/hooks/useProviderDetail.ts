import { useCallback, useEffect, useState } from 'react'
import { getProviderDetail } from '../api/analyses'
import type { ProviderDetail, ProviderId } from '../api/contract'

export type ProviderDetailLoad =
  | { phase: 'loading' }
  | { phase: 'loaded'; detail: ProviderDetail }
  | { phase: 'error' }

interface Loaded {
  key: string
  value: ProviderDetailLoad
}

/** 선택한 공급자의 근거 코드. providerId가 없으면 부르지 않는다. */
export function useProviderDetail(analysisId: string, providerId: ProviderId | undefined) {
  const key = providerId ? `${analysisId}/${providerId}` : ''
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!providerId) return
    const controller = new AbortController()
    getProviderDetail(analysisId, providerId, controller.signal).then(
      (detail) => setLoaded({ key, value: { phase: 'loaded', detail } }),
      () => {
        if (!controller.signal.aborted) setLoaded({ key, value: { phase: 'error' } })
      },
    )
    return () => controller.abort()
  }, [analysisId, providerId, key, attempt])

  const retry = useCallback(() => {
    setLoaded(null)
    setAttempt((n) => n + 1)
  }, [])

  // 다른 공급자로 바뀌었거나 다시 시도 중이면 이전 결과 대신 "불러오는 중"
  const load: ProviderDetailLoad = loaded?.key === key ? loaded.value : { phase: 'loading' }
  return { load, retry }
}
