import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'

const PARAM = 'demo'

/**
 * 데모 재현 켜짐/꺼짐을 주소의 ?demo=1 로 관리한다 (기본 꺼짐).
 * 모바일 상세로 이동해도 같은 주소 파라미터를 들고 가서 재현 상태가 유지된다.
 */
export function useDemoMode() {
  const location = useLocation()
  const navigate = useNavigate()
  const enabled = new URLSearchParams(location.search).get(PARAM) === '1'

  const setEnabled = useCallback(
    (next: boolean) => {
      const params = new URLSearchParams(location.search)
      if (next) params.set(PARAM, '1')
      else params.delete(PARAM)
      const search = params.toString()
      navigate(`${location.pathname}${search ? `?${search}` : ''}`, { replace: true, state: location.state })
    },
    [location.pathname, location.search, location.state, navigate],
  )

  return { enabled, setEnabled }
}
