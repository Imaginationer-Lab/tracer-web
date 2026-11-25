import type { ProviderId, ProviderSummary } from '../../../api/contract'
import { Card, CardHeader } from '../../../components/ui/Card'
import type { ProviderStatusLoad } from '../../../lib/providerStatus'
import styles from './ProviderList.module.css'
import { ProviderRow } from './ProviderRow'

interface ProviderListProps {
  providers: ProviderSummary[]
  statuses: Partial<Record<ProviderId, ProviderStatusLoad>>
  onRetryStatus: (providerId: ProviderId) => void
}

export function ProviderList({ providers, statuses, onRetryStatus }: ProviderListProps) {
  return (
    <Card>
      <CardHeader title="탐지된 외부 서비스" aside={<span className={styles.count}>{providers.length}</span>} />
      <ul>
        {providers.map((provider) => (
          <ProviderRow
            key={provider.id}
            provider={provider}
            statusLoad={statuses[provider.id]}
            onRetryStatus={() => onRetryStatus(provider.id)}
          />
        ))}
      </ul>
      <p className={styles.footnote}>탐지 결과는 정적 분석 기반의 점검 후보예요. 간접 호출은 누락될 수 있어요.</p>
    </Card>
  )
}
