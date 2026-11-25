import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { paths } from '../../app/paths'
import { LogoIcon } from '../icons/LogoIcon'
import styles from './AppHeader.module.css'

interface AppHeaderProps {
  /** 워드마크 오른쪽에 붙는 내용 (예: SCR-002의 저장소·브랜치) */
  leading?: ReactNode
  /** 헤더 오른쪽 끝 내용 (예: 데모 재현 스위치, 다른 저장소 분석 버튼) */
  trailing?: ReactNode
}

export function AppHeader({ leading, trailing }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.start}>
        <Link to={paths.home} className={styles.wordmark} aria-label="Tracer 처음 화면">
          <LogoIcon size={18} />
          <span>Tracer</span>
        </Link>
        {leading}
      </div>
      {trailing && <div className={styles.end}>{trailing}</div>}
    </header>
  )
}
