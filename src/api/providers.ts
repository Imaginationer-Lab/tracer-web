import { request } from './client'
import type { ProviderId, ProviderStatus } from './contract'

/** 공급자 공개 상태. statusSupport === 'live' 인 공급자만 부른다 (지금은 Supabase). */
export function getProviderStatus(providerId: ProviderId, signal?: AbortSignal): Promise<ProviderStatus> {
  return request<ProviderStatus>(`/providers/${encodeURIComponent(providerId)}/status`, { signal })
}
