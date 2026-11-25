import type { ProviderId, ProviderSummary } from '../../../api/contract'
import { Card, CardHeader } from '../../../components/ui/Card'
import type { ProviderStatusLoad } from '../../../lib/providerStatus'
import styles from './ProviderList.module.css'
import { ProviderRow } from './ProviderRow'

interface ProviderListProps {
  providers: ProviderSummary[]
  statuses: Partial<Record<ProviderId, ProviderStatusLoad>>
  selectedId: ProviderId | undefined
  /** 데모 재현 중이면 이벤트의 공급자와 HTTP 코드 */
  replay?: { providerId: ProviderId; httpStatus: number }
  onSelect: (providerId: ProviderId) => void
  onRetryStatus: (providerId: ProviderId) => void
}

export function ProviderList({ providers, statuses, selectedId, replay, onSelect, onRetryStatus }: ProviderListProps) {
  return (
    <Card>
      <CardHeader title="탐지된 외부 서비스" aside={<span className={styles.count}>{providers.length}</span>} />
      <ul>
        {providers.map((provider) => (
          <ProviderRow
            key={provider.id}
            provider={provider}
            statusLoad={statuses[provider.id]}
            selected={provider.id === selectedId}
            replayStatus={replay?.providerId === provider.id ? replay.httpStatus : undefined}
            onSelect={() => onSelect(provider.id)}
            onRetryStatus={() => onRetryStatus(provider.id)}
          />
        ))}
      </ul>
      <p className={styles.footnote}>탐지 결과는 정적 분석 기반의 점검 후보예요. 간접 호출은 누락될 수 있어요.</p>
    </Card>
  )
}
