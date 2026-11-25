import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProviderId, ProviderSummary } from '../api/contract'
import { getProviderStatus } from '../api/providers'
import type { ProviderStatusLoad } from '../lib/providerStatus'

/**
 * statusSupport === 'live' 인 공급자의 공개 상태를 조회한다.
 * 실패는 그 공급자에만 표시하고, 목록·파일 트리는 그대로 쓴다.
 */
export function useProviderStatuses(providers: ProviderSummary[]) {
  const [statuses, setStatuses] = useState<Partial<Record<ProviderId, ProviderStatusLoad>>>({})
  const controllersRef = useRef(new Map<ProviderId, AbortController>())

  // 결과가 아직 없는 공급자는 "조회 중"으로 보이므로, 첫 조회에서는 loading을 따로 넣지 않는다
  const fetchStatus = useCallback(async (providerId: ProviderId) => {
    controllersRef.current.get(providerId)?.abort()
    const controller = new AbortController()
    controllersRef.current.set(providerId, controller)

    try {
      const status = await getProviderStatus(providerId, controller.signal)
      setStatuses((prev) => ({ ...prev, [providerId]: { phase: 'loaded', status } }))
    } catch {
      if (controller.signal.aborted) return
      setStatuses((prev) => ({ ...prev, [providerId]: { phase: 'error' } }))
    }
  }, [])

  const liveIds = providers
    .filter((p) => p.statusSupport === 'live')
    .map((p) => p.id)
    .join(',')

  useEffect(() => {
    const controllers = controllersRef.current
    const ids = liveIds ? (liveIds.split(',') as ProviderId[]) : []
    // fetchStatus는 응답을 받은 뒤(await 이후)에만 setState 하므로 동기 setState가 아니다
    // oxlint-disable-next-line react/set-state-in-effect
    for (const id of ids) void fetchStatus(id)
    return () => {
      for (const controller of controllers.values()) controller.abort()
      controllers.clear()
    }
  }, [liveIds, fetchStatus])

  /** "다시 조회": 조회 중으로 바꾸고 다시 부른다 */
  const refetch = useCallback(
    (providerId: ProviderId) => {
      setStatuses((prev) => ({ ...prev, [providerId]: { phase: 'loading' } }))
      void fetchStatus(providerId)
    },
    [fetchStatus],
  )

  return { statuses, refetch }
}
