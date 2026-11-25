import type { ProviderId, ProviderSummary } from '../api/contract'

/** 탐지 결과에 없을 때 쓸 이름. 백엔드가 id를 고정해 둔 서비스만 둔다 */
const KNOWN_NAMES: Record<string, string> = {
  supabase: 'Supabase',
  stripe: 'Stripe',
  'aws-s3': 'Amazon S3',
}

/**
 * 서비스 id를 화면용 이름으로 바꾼다 (예: 재현 이벤트의 공급자).
 * 탐지 결과에 있으면 그 name, 없으면 알려진 이름, 그것도 없으면 id 그대로.
 */
export function providerName(id: ProviderId, providers: ProviderSummary[]): string {
  return providers.find((provider) => provider.id === id)?.name ?? KNOWN_NAMES[id] ?? id
}
