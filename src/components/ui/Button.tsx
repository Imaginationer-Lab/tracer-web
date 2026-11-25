import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: 잉크 배경 · ghost: 흰 배경 + 1px 선 */
  variant?: 'primary' | 'ghost'
  /** md: 40px · sm: 32px */
  size?: 'md' | 'sm'
  /** 진행 중: 스피너를 붙이고 누를 수 없게 한다 */
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ')

  return (
    <button {...rest} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}
