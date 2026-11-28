import { request } from './client'
import type { Analysis, ProviderAlternatives, ProviderDetail, ProviderId } from './contract'

/** 분석 시작. 202(새 분석, running)와 200(같은 커밋 결과, done) 모두 성공이고 본문의 status로 분기한다. */
export function startAnalysis(repoUrl: string, signal?: AbortSignal): Promise<Analysis> {
  return request<Analysis>('/analyses', { method: 'POST', body: { repoUrl }, signal })
}

/** 분석 상태·결과. status가 done 또는 failed가 될 때까지 폴링한다. */
export function getAnalysis(analysisId: string, signal?: AbortSignal): Promise<Analysis> {
  return request<Analysis>(`/analyses/${encodeURIComponent(analysisId)}`, { signal })
}

/** 공급자를 선택했을 때의 근거 코드. 분석이 done 이후에만 부른다. */
export function getProviderDetail(analysisId: string, providerId: ProviderId, signal?: AbortSignal): Promise<ProviderDetail> {
  return request<ProviderDetail>(
    `/analyses/${encodeURIComponent(analysisId)}/providers/${encodeURIComponent(providerId)}`,
    { signal },
  )
}

/** 이 저장소가 그 서비스에서 쓰는 기능 기준 대체 서비스 (AI 제안). 처음은 몇 초 걸려서 버튼을 눌렀을 때만 부른다. */
export function getProviderAlternatives(
  analysisId: string,
  providerId: ProviderId,
  signal?: AbortSignal,
): Promise<ProviderAlternatives> {
  return request<ProviderAlternatives>(
    `/analyses/${encodeURIComponent(analysisId)}/providers/${encodeURIComponent(providerId)}/alternatives`,
    { signal },
  )
}
