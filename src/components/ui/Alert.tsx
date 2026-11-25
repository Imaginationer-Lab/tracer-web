import type { ReactNode } from 'react'
import { AlertIcon } from '../icons/AlertIcon'
import styles from './Alert.module.css'

interface AlertProps {
  tone: 'error' | 'warning'
  title: string
  children: ReactNode
  /** 오른쪽(데스크톱) · 아래(모바일)에 붙는 버튼 */
  action?: ReactNode
}

/** 왼쪽 색 막대 + 아이콘 + 제목 + 본문. 색만으로 의미를 전하지 않도록 제목을 항상 쓴다. */
export function Alert({ tone, title, children, action }: AlertProps) {
  return (
    <div className={[styles.alert, styles[tone]].join(' ')} role={tone === 'error' ? 'alert' : 'status'}>
      <AlertIcon size={16} className={styles.icon} />
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <div className={styles.body}>{children}</div>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
