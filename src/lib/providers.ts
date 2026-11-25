import type { ProviderId } from '../api/contract'

/** 탐지 결과에 없는 공급자(예: 재현 이벤트의 공급자)를 이름으로 보여줄 때 */
export const PROVIDER_NAMES: Record<ProviderId, string> = {
  supabase: 'Supabase',
  stripe: 'Stripe',
  'aws-s3': 'Amazon S3',
}
