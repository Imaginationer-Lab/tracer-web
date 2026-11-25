import type { ProviderSummary } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { StatusPill } from '../../../components/ui/StatusPill'
import { describeProviderStatus, type ProviderStatusLoad } from '../../../lib/providerStatus'
import styles from './ProviderRow.module.css'

interface ProviderRowProps {
  provider: ProviderSummary
  statusLoad: ProviderStatusLoad | undefined
  selected: boolean
  onSelect: () => void
  onRetryStatus: () => void
}

/**
 * 공급자 한 줄. 행 전체가 선택 버튼이고(겹쳐 놓은 투명 버튼), "다시 조회"는 그 위에 따로 눌린다.
 */
export function ProviderRow({ provider, statusLoad, selected, onSelect, onRetryStatus }: ProviderRowProps) {
  const status = describeProviderStatus(provider, statusLoad)

  return (
    <li className={styles.row} data-selected={selected || undefined}>
      <button
        type="button"
        className={styles.select}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${provider.name} ${provider.role} 근거 보기`}
      />
      <div className={styles.main}>
        <div className={styles.top}>
          <span className={styles.name}>
            <strong>{provider.name}</strong>
            <span className={styles.role}>{provider.role}</span>
          </span>
          <StatusPill label={status.label} tone={status.tone} marker={status.marker} className={styles.pill} />
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
