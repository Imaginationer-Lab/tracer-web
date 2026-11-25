import type { ProviderSummary } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { StatusPill } from '../../../components/ui/StatusPill'
import { describeProviderStatus, type ProviderStatusLoad } from '../../../lib/providerStatus'
import styles from './ProviderRow.module.css'

interface ProviderRowProps {
  provider: ProviderSummary
  statusLoad: ProviderStatusLoad | undefined
  onRetryStatus: () => void
}

export function ProviderRow({ provider, statusLoad, onRetryStatus }: ProviderRowProps) {
  const status = describeProviderStatus(provider, statusLoad)

  return (
    <li className={styles.row}>
      <div className={styles.main}>
        <div className={styles.top}>
          <span className={styles.name}>
            <strong>{provider.name}</strong>
            <span className={styles.role}>{provider.role}</span>
          </span>
          <StatusPill label={status.label} tone={status.tone} marker={status.marker} />
        </div>
        <div className={styles.meta}>
          <span>
            {provider.usage === 'declared-only' ? '의존성만 선언 · 호출 위치 못 찾음' : `근거 파일 ${provider.fileCount}개`}
          </span>
          <span className={styles.status}>
            {status.meta}
            {status.retryable && (
              <>
                {' · '}
                <button type="button" className={styles.retry} onClick={onRetryStatus}>
                  다시 조회
                </button>
              </>
            )}
          </span>
        </div>
      </div>
      <Icon name="chevronRight" size={16} className={styles.chevron} />
    </li>
  )
}
