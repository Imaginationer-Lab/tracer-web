import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { OtherServiceSummary, ProviderId, ProviderSummary } from '../../api/contract'

const PROVIDER_PARAM = 'provider'
const OTHER_PARAM = 'other'

interface SelectionState {
  /** 목록에서 눌러 들어온 상세 화면이면 true (뒤로 가기로 목록에 돌아갈 수 있음) */
  fromList?: boolean
}

/** 지금 고른 것: 세 공급자 중 하나, 또는 그 밖의 외부 서비스(AI 판단) 하나 */
export type Selection =
  | { kind: 'provider'; provider: ProviderSummary }
  | { kind: 'other'; service: OtherServiceSummary }

type Target = { kind: 'provider'; id: ProviderId } | { kind: 'other'; name: string }

/**
 * 선택을 주소의 ?provider= 또는 ?other= 로 관리한다 (둘 중 하나만).
 * - 데스크톱: 같은 화면에서 패널만 바뀌므로 기록을 쌓지 않는다(replace). 다시 누르면 선택 해제.
 * - 모바일: 상세 화면으로 "이동"하므로 기록을 쌓고(push), 뒤로 가면 목록으로 돌아온다.
 */
export function useProviderSelection(providers: ProviderSummary[], others: OtherServiceSummary[], isMobile: boolean) {
  const navigate = useNavigate()
  const location = useLocation()
  const listScrollRef = useRef(0)

  const params = new URLSearchParams(location.search)
  const provider = providers.find((p) => p.id === params.get(PROVIDER_PARAM))
  const service = provider ? undefined : others.find((o) => o.name === params.get(OTHER_PARAM))
  const selection: Selection | null = provider
    ? { kind: 'provider', provider }
    : service
      ? { kind: 'other', service }
      : null
  const selectedKey = provider ? `provider:${provider.id}` : service ? `other:${service.name}` : null

  const pathWith = useCallback(
    (target: Target | null) => {
      const next = new URLSearchParams(location.search)
      next.delete(PROVIDER_PARAM)
      next.delete(OTHER_PARAM)
      if (target?.kind === 'provider') next.set(PROVIDER_PARAM, target.id)
      if (target?.kind === 'other') next.set(OTHER_PARAM, target.name)
      const search = next.toString()
      return `${location.pathname}${search ? `?${search}` : ''}`
    },
    [location.pathname, location.search],
  )

  const go = useCallback(
    (target: Target) => {
      const key = target.kind === 'provider' ? `provider:${target.id}` : `other:${target.name}`
      if (isMobile) {
        listScrollRef.current = window.scrollY
        navigate(pathWith(target), { state: { fromList: true } satisfies SelectionState })
      } else {
        navigate(pathWith(key === selectedKey ? null : target), { replace: true })
      }
    },
    [isMobile, navigate, pathWith, selectedKey],
  )

  const selectProvider = useCallback((id: ProviderId) => go({ kind: 'provider', id }), [go])
  const selectOther = useCallback((name: string) => go({ kind: 'other', name }), [go])

  /** 모바일 상세의 "서비스 목록" */
  const backToList = useCallback(() => {
    if ((location.state as SelectionState | null)?.fromList) navigate(-1)
    else navigate(pathWith(null), { replace: true })
  }, [location.state, navigate, pathWith])

  // 모바일: 상세로 들어가면 맨 위에서 시작하고, 목록으로 돌아오면 보던 위치로 되돌린다
  useEffect(() => {
    if (!isMobile) return
    window.scrollTo(0, selectedKey ? 0 : listScrollRef.current)
  }, [isMobile, selectedKey])

  return { selection, selectProvider, selectOther, backToList }
}
