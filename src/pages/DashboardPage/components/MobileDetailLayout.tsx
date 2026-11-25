import type { ReactNode } from 'react'
import { Icon } from '../../../components/icons/Icon'
import styles from './MobileDetailLayout.module.css'

interface MobileDetailLayoutProps {
  title: string
  /** 제목 옆 회색 보조 문구 (예: 결제) */
  subtitle?: string
  /** 제목 아래 상태 줄 (배지 + 보조 문구) */
  status: ReactNode
  onBack: () => void
  children: ReactNode
}

/** 모바일 상세 화면의 틀: 상단 고정 "서비스 목록" + 제목 + 상태 + 본문 */
export function MobileDetailLayout({ title, subtitle, status, onBack, children }: MobileDetailLayoutProps) {
  return (
    <div className={styles.detail}>
      <div className={styles.topBar}>
        <button type="button" className={styles.back} onClick={onBack}>
          <Icon name="chevronLeft" size={18} />
          서비스 목록
        </button>
      </div>
      <main className={styles.body}>
        <header className={styles.title}>
          <h1>
            {title}
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </h1>
          <div className={styles.status}>{status}</div>
        </header>
        {children}
      </main>
    </div>
  )
}
