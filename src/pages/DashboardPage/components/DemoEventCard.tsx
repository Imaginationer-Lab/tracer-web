import type { DemoEvent } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { formatKstDateTime } from '../../../lib/time'
import styles from './DemoEventCard.module.css'

interface DemoEventCardProps {
  event: DemoEvent
  /** 이벤트의 공급자 이름 (예: Stripe) */
  providerName: string
  /** 이벤트 공급자가 이 저장소에서 탐지되지 않았을 때 */
  notDetected: boolean
}

/** 재현 이벤트 카드. 실제 공개 상태가 아니라는 표시를 항상 함께 둔다. */
export function DemoEventCard({ event, providerName, notDetected }: DemoEventCardProps) {
  return (
    <section className={styles.card} aria-label="데모 재현 이벤트">
      <div className={styles.top}>
        <h2 className={styles.title}>
          <Icon name="alert" size={16} className={styles.icon} />
          {event.title}
        </h2>
        <span className={styles.badge}>데모 재현</span>
      </div>
      <p className={styles.meta}>
        <code className={styles.status}>HTTP {event.httpStatus}</code>
        <code>{formatKstDateTime(event.occurredAt)}</code>
      </p>
      <p className={styles.note}>재현 데이터 · 실제 공개 상태 아님</p>
      {notDetected && (
        <p className={styles.noMatch}>
          <Icon name="info" size={14} className={styles.infoIcon} />이 저장소에서 {providerName} 관련 파일을 찾지 못했어요
        </p>
      )}
    </section>
  )
}
