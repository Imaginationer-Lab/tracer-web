import type { ProviderCategory, ProviderSummary } from '../api/contract'

/** 문구에 넣는 분류 이름. role은 AI가 서비스마다 다르게 붙일 수 있어서 쓰지 않는다 */
const CATEGORY_LABELS: Partial<Record<ProviderCategory, string>> = {
  auth: '로그인',
  payment: '결제',
  storage: '파일 저장',
  database: '데이터베이스',
  ai: 'AI 모델',
  messaging: '메시지',
  monitoring: '모니터링',
  analytics: '분석',
}

export interface SameCategory {
  /** 분류 이름 (예: 결제) */
  label: string
  /** 같은 분류에서 실제 호출이 있는 다른 서비스 (백엔드 정렬 순서 그대로) */
  services: ProviderSummary[]
}

/**
 * 고른 서비스와 같은 분류로 실제 호출되고 있는 다른 서비스.
 * 코드로는 "같은 역할"까지만 알 수 있고 서로 대체할 수 있는지는 알 수 없으므로, 화면 문구는 사실만 쓴다.
 * - other(지도, 외부 데이터 API 등)는 서로 관계없는 서비스가 섞여 있어 묶지 않는다
 * - 의존성만 선언된 서비스(declared-only)는 호출 위치가 없어 뺀다
 * - 모르는 분류 값이 와도 other처럼 취급해 묶지 않는다
 */
export function findSameCategory(provider: ProviderSummary, providers: ProviderSummary[]): SameCategory | null {
  const label = CATEGORY_LABELS[provider.category]
  if (!label) return null
  const services = providers.filter(
    (other) => other.id !== provider.id && other.category === provider.category && other.usage === 'used',
  )
  return services.length > 0 ? { label, services } : null
}

/** 서비스의 대표 근거 위치 (예: src/payments/toss.ts:2) */
export function primaryLocation(service: ProviderSummary): string | undefined {
  const file = service.files[0]
  return file ? `${file.path}:${file.line}` : undefined
}
