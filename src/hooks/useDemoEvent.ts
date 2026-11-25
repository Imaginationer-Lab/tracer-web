import { useEffect, useState } from 'react'
import type { DemoEvent } from '../api/contract'
import { getCurrentDemoEvent } from '../api/demo'

export type DemoEventLoad =
  | { phase: 'off' }
  | { phase: 'loading' }
  | { phase: 'loaded'; event: DemoEvent }
  | { phase: 'error' }

/** 데모 재현이 켜져 있을 때만 재현 이벤트를 불러온다. 실제 공개 상태와는 섞지 않는다. */
export function useDemoEvent(enabled: boolean): DemoEventLoad {
  const [loaded, setLoaded] = useState<DemoEventLoad | null>(null)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    getCurrentDemoEvent(controller.signal).then(
      (event) => setLoaded({ phase: 'loaded', event }),
      () => {
        if (!controller.signal.aborted) setLoaded({ phase: 'error' })
      },
    )
    return () => {
      controller.abort()
      setLoaded(null)
    }
  }, [enabled])

  if (!enabled) return { phase: 'off' }
  return loaded ?? { phase: 'loading' }
}
