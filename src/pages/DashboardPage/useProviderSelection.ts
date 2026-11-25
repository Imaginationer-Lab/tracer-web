import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import type { ProviderId, ProviderSummary } from '../../api/contract'

const PARAM = 'provider'

interface SelectionState {
  /** 목록에서 눌러 들어온 상세 화면이면 true (뒤로 가기로 목록에 돌아갈 수 있음) */
  fromList?: boolean
}

/**
 * 선택한 공급자를 주소의 ?provider= 로 관리한다.
 * - 데스크톱: 같은 화면에서 근거 패널만 바뀌므로 기록을 쌓지 않는다(replace). 다시 누르면 선택 해제.
 * - 모바일: 상세 화면으로 "이동"하므로 기록을 쌓고(push), 뒤로 가면 목록으로 돌아온다.
 */
export function useProviderSelection(providers: ProviderSummary[], isMobile: boolean) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listScrollRef = useRef(0)

  const param = searchParams.get(PARAM)
  const selected = providers.find((provider) => provider.id === param)

  const pathWith = useCallback(
    (providerId: ProviderId | null) => {
      const next = new URLSearchParams(location.search)
      if (providerId) next.set(PARAM, providerId)
      else next.delete(PARAM)
      const search = next.toString()
      return `${location.pathname}${search ? `?${search}` : ''}`
    },
    [location.pathname, location.search],
  )

  const select = useCallback(
    (providerId: ProviderId) => {
      if (isMobile) {
        listScrollRef.current = window.scrollY
        navigate(pathWith(providerId), { state: { fromList: true } satisfies SelectionState })
      } else {
        navigate(pathWith(providerId === selected?.id ? null : providerId), { replace: true })
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
  const selectedId = selected?.id
  useEffect(() => {
    if (!isMobile) return
    window.scrollTo(0, selectedId ? 0 : listScrollRef.current)
  }, [isMobile, selectedId])

  return { selected, select, backToList }
}
