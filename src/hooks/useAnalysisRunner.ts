import { useCallback, useEffect, useRef, useState } from 'react'
import { getAnalysis, startAnalysis } from '../api/analyses'
import { ApiRequestError, clientError, type AppError } from '../api/client'
import type { Analysis } from '../api/contract'
import { ANALYSIS_POLL_INTERVAL_MS, ANALYSIS_TIMEOUT_MS } from '../app/config'
import { wait } from '../lib/wait'

export type AnalysisRunState =
  | { phase: 'idle' }
  /** analysis가 null이면 아직 POST 응답 전 */
  | { phase: 'running'; analysis: Analysis | null }
  /**
   * analysis가 있으면 분석이 status: failed로 끝난 것, 없으면 요청 자체가 실패한 것.
   * attempt는 실행할 때마다 늘어나는 번호라 오류 화면의 key로 쓴다.
   */
  | { phase: 'failed'; analysis: Analysis | null; error: AppError; attempt: number }

const TIMEOUT_ERROR = clientError('timeout')
const UNKNOWN_ERROR = clientError('unknown')

/**
 * 분석을 시작하고 끝날 때까지 폴링한다.
 * POST /analyses → (running이면) 1초마다 GET /analyses/:id → done이면 onDone, failed면 오류 상태.
 */
export function useAnalysisRunner(onDone: (analysis: Analysis) => void) {
  const [state, setState] = useState<AnalysisRunState>({ phase: 'idle' })
  const controllerRef = useRef<AbortController | null>(null)
  const attemptRef = useRef(0)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => () => controllerRef.current?.abort(), [])

  const run = useCallback(async (repoUrl: string) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller
    const attempt = ++attemptRef.current

    setState({ phase: 'running', analysis: null })

    try {
      let analysis = await startAnalysis(repoUrl, signal)
      const deadline = Date.now() + ANALYSIS_TIMEOUT_MS

      while (analysis.status === 'running') {
        setState({ phase: 'running', analysis })
        if (Date.now() > deadline) {
          setState({ phase: 'failed', analysis: null, error: TIMEOUT_ERROR, attempt })
          return
        }
        await wait(ANALYSIS_POLL_INTERVAL_MS, signal)
        analysis = await getAnalysis(analysis.id, signal)
      }

      if (analysis.status === 'done') {
        setState({ phase: 'running', analysis })
        onDoneRef.current(analysis)
      } else {
        setState({ phase: 'failed', analysis, error: analysis.error ?? UNKNOWN_ERROR, attempt })
      }
    } catch (cause) {
      if (signal.aborted) return
      const error = cause instanceof ApiRequestError ? cause.error : UNKNOWN_ERROR
      setState({ phase: 'failed', analysis: null, error, attempt })
    }
  }, [])

  const reset = useCallback(() => {
    controllerRef.current?.abort()
    setState({ phase: 'idle' })
  }, [])

  return { state, run, reset }
}
