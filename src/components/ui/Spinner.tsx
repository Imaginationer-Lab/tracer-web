import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: number
  className?: string
}

/** 진행 중 표시. 색은 부모의 color를 따른다. */
export function Spinner({ size = 14, className }: SpinnerProps) {
  return (
    <svg
      className={[styles.spinner, className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  )
}
