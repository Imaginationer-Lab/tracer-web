import styles from './Switch.module.css'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** 화면에 보이는 라벨 요소의 id (aria-labelledby) */
  labelledBy?: string
  size?: 'md' | 'lg'
}

/** 켜고 끄는 스위치 (role="switch") */
export function Switch({ checked, onChange, labelledBy, size = 'md' }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      className={[styles.switch, styles[size]].join(' ')}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.thumb} aria-hidden="true" />
    </button>
  )
}
