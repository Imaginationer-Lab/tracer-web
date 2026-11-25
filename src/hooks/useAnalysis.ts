import { useEffect, useState } from 'react'
import { getAnalysis } from '../api/analyses'
import { ApiRequestError } from '../api/client'
import type { Analysis, ApiError } from '../api/contract'
import { ANALYSIS_POLL_INTERVAL_MS, ANALYSIS_TIMEOUT_MS } from '../app/config'
import { wait } from '../lib/wait'

export type AnalysisLoad =
  | { phase: 'loading'; analysis: Analysis | null }
  | { phase: 'done'; analysis: Analysis }
  | { phase: 'error'; error: ApiError }

const TIMEOUT_ERROR: ApiError = {
  code: 'INTERNAL_ERROR',
  message: '분석이 오래 걸리고 있어요. 잠시 후 다시 시도해 주세요.',
  retryable: true,
}

const UNKNOWN_ERROR: ApiError = {
  code: 'INTERNAL_ERROR',
  message: '분석 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
  retryable: true,
}

/**
 * 대시보드에서 분석 결과를 불러온다. 아직 running이면 끝날 때까지 폴링한다.
 * (보통은 SCR-001에서 done이 된 뒤 넘어오지만, 주소로 바로 들어온 경우도 처리한다)
 */
export function useAnalysis(analysisId: string): AnalysisLoad {
  const [load, setLoad] = useState<{ id: string; value: AnalysisLoad }>({
    id: analysisId,
    value: { phase: 'loading', analysis: null },
  })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const set = (value: AnalysisLoad) => setLoad({ id: analysisId, value })

    void (async () => {
      try {
        const deadline = Date.now() + ANALYSIS_TIMEOUT_MS
        let analysis = await getAnalysis(analysisId, signal)
        while (analysis.status === 'running') {
          set({ phase: 'loading', analysis })
          if (Date.now() > deadline) return set({ phase: 'error', error: TIMEOUT_ERROR })
          await wait(ANALYSIS_POLL_INTERVAL_MS, signal)
          analysis = await getAnalysis(analysisId, signal)
        }
        if (analysis.status === 'done' && analysis.result) set({ phase: 'done', analysis })
        else set({ phase: 'error', error: analysis.error ?? UNKNOWN_ERROR })
      } catch (cause) {
        if (signal.aborted) return
        set({ phase: 'error', error: cause instanceof ApiRequestError ? cause.error : UNKNOWN_ERROR })
      }
    })()

    return () => controller.abort()
  }, [analysisId])

  // 다른 분석으로 바뀐 직후에는 이전 결과를 보여주지 않는다
  return load.id === analysisId ? load.value : { phase: 'loading', analysis: null }
}
