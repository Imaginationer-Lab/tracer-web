import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { ProviderId, ProviderSummary } from '../../api/contract'

const PROVIDER_PARAM = 'provider'

interface SelectionState {
  /** 목록에서 눌러 들어온 상세 화면이면 true (뒤로 가기로 목록에 돌아갈 수 있음) */
  fromList?: boolean
}

/**
 * 고른 서비스를 주소의 ?provider= 로 관리한다.
 * - 데스크톱: 같은 화면에서 패널만 바뀌므로 기록을 쌓지 않는다(replace). 다시 누르면 선택 해제.
 * - 모바일: 상세 화면으로 "이동"하므로 기록을 쌓고(push), 뒤로 가면 목록으로 돌아온다.
 */
export function useProviderSelection(providers: ProviderSummary[], isMobile: boolean) {
  const navigate = useNavigate()
  const location = useLocation()
  const listScrollRef = useRef(0)

  const selectedId = new URLSearchParams(location.search).get(PROVIDER_PARAM)
  // 결과에 없는 id(예전 주소)는 고르지 않은 것으로 본다
  const selected = providers.find((p) => p.id === selectedId)

  const pathWith = useCallback(
    (id: ProviderId | null) => {
      const next = new URLSearchParams(location.search)
      next.delete(PROVIDER_PARAM)
      if (id) next.set(PROVIDER_PARAM, id)
      const search = next.toString()
      return `${location.pathname}${search ? `?${search}` : ''}`
    },
    [location.pathname, location.search],
  )

  const selectProvider = useCallback(
    (id: ProviderId) => {
      if (isMobile) {
        listScrollRef.current = window.scrollY
        navigate(pathWith(id), { state: { fromList: true } satisfies SelectionState })
      } else {
        navigate(pathWith(id === selected?.id ? null : id), { replace: true })
      }
    },
    [isMobile, navigate, pathWith, selected?.id],
  )

  /** 모바일 상세의 "서비스 목록" */
  const backToList = useCallback(() => {
    if ((location.state as SelectionState | null)?.fromList) navigate(-1)
    else navigate(pathWith(null), { replace: true })
  }, [location.state, navigate, pathWith])

  // 모바일: 상세로 들어가면 맨 위에서 시작하고, 목록으로 돌아오면 보던 위치로 되돌린다
  const selectedKey = selected?.id ?? null
  useEffect(() => {
    if (!isMobile) return
    window.scrollTo(0, selectedKey ? 0 : listScrollRef.current)
  }, [isMobile, selectedKey])

  return { selected, selectProvider, backToList }
}
