import type { AppError } from '../api/client'
import type { Alternative, UsedFeature } from '../api/contract'
import type { IconName } from '../components/icons/Icon'

export type Support = Alternative['coverage'][number]['support']

export interface SupportView {
  label: string
  icon: IconName
  tone: 'success' | 'warning' | 'error'
}

/** 기능 지원 여부. 색만으로 구분하지 않도록 아이콘과 글자를 함께 쓴다. */
export const SUPPORT_VIEW: Record<Support, SupportView> = {
  yes: { label: '지원', icon: 'check', tone: 'success' },
  partial: { label: '일부', icon: 'minus', tone: 'warning' },
  no: { label: '안 됨', icon: 'x', tone: 'error' },
}

export interface CoverageRow {
  key: string
  /** 화면 문구 (features[].label). 짝이 없으면 key 그대로 */
  label: string
  support: SupportView
  note: string | null
}

/** coverage[]를 쓰는 기능 이름과 짝지어 화면 줄로 바꾼다 */
export function coverageRows(alternative: Alternative, features: UsedFeature[]): CoverageRow[] {
  const labels = new Map(features.map((feature) => [feature.key, feature.label]))
  return alternative.coverage.map((item) => ({
    key: item.feature,
    label: labels.get(item.feature) ?? item.feature,
    support: SUPPORT_VIEW[item.support],
    note: item.note,
  }))
}

export interface CodeLocation {
  path: string
  line: number
}

/** 'src/payments/checkout.ts:2' */
export function formatLocation(location: CodeLocation): string {
  return `${location.path}:${location.line}`
}

/** 'checkout.ts:2' (칩처럼 좁은 자리) */
export function formatShortLocation(location: CodeLocation): string {
  const name = location.path.split('/').pop() ?? location.path
  return `${name}:${location.line}`
}

/** 오류 알림 본문. ALTERNATIVES_UNAVAILABLE의 message는 제목과 겹쳐서 뒷문장만 쓴다 */
export function alternativesErrorBody(error: AppError): string {
  if (error.code === 'ALTERNATIVES_UNAVAILABLE') return '잠시 후 다시 시도해 주세요.'
  return error.message
}
