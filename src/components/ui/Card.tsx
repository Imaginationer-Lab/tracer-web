import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** 점선 테두리 (빈 상태) */
  dashed?: boolean
}

/** 흰 바탕 + 1px 선 + 12px 모서리 상자 */
export function Card({ dashed = false, className, children, ...rest }: CardProps) {
  return (
    <section {...rest} className={[styles.card, dashed && styles.dashed, className].filter(Boolean).join(' ')}>
      {children}
    </section>
  )
}

interface CardHeaderProps {
  title: ReactNode
  /** 제목 오른쪽 보조 정보 */
  aside?: ReactNode
  className?: string
}

export function CardHeader({ title, aside, className }: CardHeaderProps) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')}>
      <h2 className={styles.title}>{title}</h2>
      {aside !== undefined && <div className={styles.aside}>{aside}</div>}
    </header>
  )
}
