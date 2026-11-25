import type { ReactNode } from 'react'
import type { OtherServiceSummary } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { Card, CardHeader } from '../../../components/ui/Card'
import { DashedBadge } from '../../../components/ui/DashedBadge'
import styles from './OtherServicePanel.module.css'

interface OtherServicePanelProps {
  service: OtherServiceSummary
  /** 데스크톱은 서비스 이름을 제목으로, 모바일 상세는 제목 없이(이름이 화면 제목) */
  showTitle?: boolean
  /** 파일 목록 아래에 붙는 내용 (모바일: 관련 파일 트리) */
  footer?: ReactNode
  className?: string
}

/** 그 밖의 외부 서비스(AI 판단)를 골랐을 때: 안내 · 판단 단서 · 파일 목록. 근거 코드는 없다. */
export function OtherServicePanel({ service, showTitle = true, footer, className }: OtherServicePanelProps) {
  return (
    <Card className={[styles.panel, className].filter(Boolean).join(' ')} aria-label={`${service.name} (AI 판단)`}>
      {showTitle && (
        <CardHeader
          title={
            <>
              {service.name}
              <DashedBadge>AI 판단</DashedBadge>
            </>
          }
          aside={`${service.fileCount}개 파일 · 파일이 많은 순`}
        />
      )}
      <div className={styles.scroll}>
        <p className={styles.notice}>
          <Icon name="info" size={14} className={styles.noticeIcon} />
          AI가 코드의 단서로 판단한 서비스예요. 공개 상태 조회와 근거 코드 보기는 지원하지 않아요. 아래 파일에서 직접 확인해
          주세요.
        </p>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>판단 단서</h3>
          <ul className={styles.clues}>
            {service.clues.map((clue) => (
              <li key={clue}>
                <code>{clue}</code>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.files}>
          <h3 className={styles.sectionTitle}>파일 {service.fileCount}개</h3>
          <ul>
            {service.files.map((file) => {
              const slash = file.path.lastIndexOf('/')
              return (
                <li key={`${file.path}:${file.line}`} className={styles.file}>
                  <code>
                    {file.path.slice(0, slash + 1)}
                    <strong>{file.path.slice(slash + 1)}</strong>
                    <span className={styles.line}>:{file.line}</span>
                  </code>
                </li>
              )
            })}
          </ul>
        </section>
        {footer}
      </div>
    </Card>
  )
}
