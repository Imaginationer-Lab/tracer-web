import { useEffect, useState } from 'react'

/**
 * 처음 렌더한 시점부터 seconds초를 센 남은 시간(초). 0이면 끝.
 * 새로 세려면 이 훅을 쓰는 컴포넌트를 key로 다시 만든다.
 */
export function useCountdown(seconds: number): number {
  const [deadline] = useState(() => Date.now() + seconds * 1000)
  const [remaining, setRemaining] = useState(Math.max(0, seconds))

  useEffect(() => {
    if (seconds <= 0) return
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) clearInterval(timer)
    }, 250)
    return () => clearInterval(timer)
  }, [deadline, seconds])

  return remaining
}
