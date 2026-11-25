import { useCallback, useSyncExternalStore } from 'react'

/** CSS 미디어 쿼리가 맞는지. 화면 폭이 바뀌면 다시 렌더한다. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}

/** tokens.css 의 모바일 구간과 같다 */
export const MOBILE_QUERY = '(max-width: 640px)'
