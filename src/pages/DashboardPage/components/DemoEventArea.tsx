import type { ProviderSummary } from '../../../api/contract'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import type { DemoEventLoad } from '../../../hooks/useDemoEvent'
import { providerName } from '../../../lib/providers'
import { DemoEventCard } from './DemoEventCard'

interface DemoEventAreaProps {
  load: DemoEventLoad
  providers: ProviderSummary[]
  onTurnOff: () => void
}

/** 데모 재현 영역: 이벤트 카드, 또는 재현 데이터 오류 알림 */
export function DemoEventArea({ load, providers, onTurnOff }: DemoEventAreaProps) {
  if (load.phase === 'error') {
    return (
      <Alert
        tone="error"
        title="데모 이벤트를 불러오지 못했어요"
        action={
          <Button variant="ghost" size="sm" onClick={onTurnOff}>
            재현 끄기
          </Button>
        }
      >
        재현 데이터가 없거나 형식이 맞지 않아요. 공급자 상태와 파일은 그대로 볼 수 있어요.
      </Alert>
    )
  }
  if (load.phase !== 'loaded') return null

  const { event } = load
  const detected = providers.some((provider) => provider.id === event.providerId)
  return <DemoEventCard event={event} providerName={providerName(event.providerId, providers)} notDetected={!detected} />
}
