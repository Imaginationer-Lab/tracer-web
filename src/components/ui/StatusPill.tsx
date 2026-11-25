import type { StatusTone } from '../../lib/providerStatus'
import styles from './StatusPill.module.css'
import { Spinner } from './Spinner'

interface StatusPillProps {
  label: string
  tone: StatusTone
  marker?: 'solid' | 'hollow' | 'spinner'
  className?: string
}

/** 점 + 텍스트 상태 배지. 색과 텍스트를 함께 쓴다. */
export function StatusPill({ label, tone, marker = 'solid', className }: StatusPillProps) {
  return (
    <span className={[styles.pill, styles[tone], className].filter(Boolean).join(' ')}>
      {marker === 'spinner' ? (
        <Spinner size={10} />
      ) : (
        <span className={marker === 'hollow' ? styles.hollow : styles.dot} aria-hidden="true" />
      )}
      {label}
    </span>
  )
}
