import type { ReactNode } from 'react'
import styles from './CodeLocationLink.module.css'

interface CodeLocationLinkProps {
  path: string
  /** 있으면 누를 수 있다 (그 파일의 근거를 펼친다) */
  onOpen?: (path: string) => void
  className?: string
  children: ReactNode
}

/** 코드 위치 문구. 근거로 이동할 수 있는 위치만 버튼으로 그린다. */
export function CodeLocationLink({ path, onOpen, className, children }: CodeLocationLinkProps) {
  if (!onOpen) return <span className={className}>{children}</span>
  return (
    <button
      type="button"
      className={[styles.link, className].filter(Boolean).join(' ')}
      onClick={() => onOpen(path)}
      title="근거 코드 보기"
    >
      {children}
    </button>
  )
}
