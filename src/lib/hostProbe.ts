import type { ServiceHost } from '../api/contract'

export type HostProbeTone = 'success' | 'error' | 'neutral'

export interface HostProbeView {
  /** 백엔드 문구 그대로 (응답 있음 · 응답 이상 · 확인 불가) */
  label: string
  tone: HostProbeTone
  marker: 'solid' | 'hollow'
  /** 응답 이상일 때만: HTTP 503 · 응답 없음 */
  detail?: string
}

/**
 * 호스트 응답 확인 결과 → 점 + 글자.
 * 목록의 공식 상태 배지와 무게가 달라 배지(둥근 바탕) 모양은 쓰지 않는다.
 * - 응답 있음: 서버가 살아 있다는 뜻이라 2xx·4xx 구분 없이 초록. 숫자는 고장처럼 읽혀서 숨긴다
 * - 응답 이상: 빨강. 숫자가 의미 있어서 보여준다 (응답이 없으면 "응답 없음")
 * - 확인 불가: 공식 상태의 "상태 확인 불가"와 같은 빈 점 회색 (정상처럼 보이지 않게)
 */
export function describeHostProbe({ probe }: ServiceHost): HostProbeView {
  if (probe.result === 'ok') return { label: probe.label, tone: 'success', marker: 'solid' }
  if (probe.result === 'error') {
    const detail = probe.httpStatus === null ? '응답 없음' : `HTTP ${probe.httpStatus}`
    return { label: probe.label, tone: 'error', marker: 'solid', detail }
  }
  return { label: probe.label, tone: 'neutral', marker: 'hollow' }
}

/** 머리글에 쓰는 확인 시각: 가장 최근에 확인한 호스트 기준 (호스트마다 캐시 시점이 조금씩 다르다) */
export function latestCheckedAt(hosts: ServiceHost[]): string | undefined {
  return hosts.map((host) => host.probe.checkedAt).sort().at(-1)
}

/**
 * 데모 재현 칩을 붙일 호스트: 코드에서 실제로 부르는 첫 호스트 (없으면 첫 호스트).
 * 재현 이벤트에는 호스트 정보가 없어서, 서비스의 모든 호스트에 붙이면 전부 실패한 것처럼 보인다.
 */
export function replayHostIndex(hosts: ServiceHost[]): number {
  const called = hosts.findIndex((host) => host.files.length > 0)
  return called === -1 ? 0 : called
}
