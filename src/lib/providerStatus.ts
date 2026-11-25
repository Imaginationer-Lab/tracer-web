import type { ProviderStatus, ProviderSummary } from '../api/contract'
import { formatKstTime } from './time'

/** 공급자 공개 상태를 불러오는 상태 (statusSupport: live 인 공급자만) */
export type ProviderStatusLoad =
  | { phase: 'loading' }
  | { phase: 'loaded'; status: ProviderStatus }
  | { phase: 'error' }

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral'

export interface ProviderStatusView {
  label: string
  tone: StatusTone
  /** solid: 꽉 찬 점 · hollow: 빈 점(정상처럼 보이지 않게) · spinner: 조회 중 */
  marker: 'solid' | 'hollow' | 'spinner'
  /** 배지 옆 보조 문구 */
  meta: string
  /** 조회 실패: "다시 조회"를 붙인다 */
  retryable: boolean
}

const STATE_VIEW: Record<ProviderStatus['state'], Pick<ProviderStatusView, 'label' | 'tone' | 'marker'>> = {
  operational: { label: '정상', tone: 'success', marker: 'solid' },
  degraded: { label: '성능 저하', tone: 'warning', marker: 'solid' },
  outage: { label: '장애', tone: 'error', marker: 'solid' },
  maintenance: { label: '점검 중', tone: 'info', marker: 'solid' },
  unknown: { label: '상태 확인 불가', tone: 'neutral', marker: 'hollow' },
}

/** 공급자 행의 상태 배지와 보조 문구. 문구는 figdora "공급자 상태 배지" 시트를 따른다. */
export function describeProviderStatus(provider: ProviderSummary, load: ProviderStatusLoad | undefined): ProviderStatusView {
  if (provider.statusSupport === 'none') {
    return { label: '실시간 연동 전', tone: 'neutral', marker: 'solid', meta: '공식 상태 미연동', retryable: false }
  }
  if (!load || load.phase === 'loading') {
    return { label: '조회 중', tone: 'neutral', marker: 'spinner', meta: '공식 상태 조회 중', retryable: false }
  }
  if (load.phase === 'error') {
    return { label: '상태 확인 불가', tone: 'neutral', marker: 'hollow', meta: '조회 실패', retryable: true }
  }
  return {
    ...STATE_VIEW[load.status.state],
    meta: `공식 상태 · ${formatKstTime(load.status.fetchedAt)} 조회`,
    retryable: false,
  }
}
