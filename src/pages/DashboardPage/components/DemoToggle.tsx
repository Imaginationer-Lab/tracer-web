import { useId } from 'react'
import { Switch } from '../../../components/ui/Switch'
import styles from './DemoToggle.module.css'

interface DemoToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  /** header: 데스크톱 헤더 안 한 줄 · bar: 모바일 저장소 바 (설명 포함) */
  variant: 'header' | 'bar'
}

export function DemoToggle({ enabled, onChange, variant }: DemoToggleProps) {
  const labelId = useId()

  return (
    <div className={[styles.toggle, styles[variant]].join(' ')}>
      <span className={styles.label}>
        <span id={labelId} className={styles.title}>
          데모 재현
        </span>
        {variant === 'bar' && <span className={styles.description}>Stripe 503 재현 데이터를 재생해요</span>}
      </span>
      <Switch checked={enabled} onChange={onChange} labelledBy={labelId} size={variant === 'bar' ? 'lg' : 'md'} />
    </div>
  )
}
