import type { ReactNode } from 'react'
import type { ProviderSummary } from '../../../api/contract'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Card, CardHeader } from '../../../components/ui/Card'
import { Spinner } from '../../../components/ui/Spinner'
import type { ProviderDetailLoad } from '../../../hooks/useProviderDetail'
import { EvidenceItem } from './EvidenceItem'
import styles from './EvidencePanel.module.css'

interface EvidencePanelProps {
  provider: ProviderSummary
  load: ProviderDetailLoad
  onRetry: () => void
  /** 제목. 데스크톱은 "Stripe 근거", 모바일 상세는 "근거" */
  title?: string
  /** 근거 목록 아래에 붙는 내용 (관련 파일, 대응 가이드) */
  footer?: ReactNode
  className?: string
}

function Body({ provider, load, onRetry }: Pick<EvidencePanelProps, 'provider' | 'load' | 'onRetry'>) {
  if (load.phase === 'loading') {
    return (
      <div className={styles.loading} role="status">
        <p className={styles.loadingText}>
          <Spinner size={14} />
          근거 코드를 불러오고 있어요
        </p>
        <span className={styles.skeleton} style={{ width: '60%' }} />
        <span className={styles.skeleton} style={{ width: '90%' }} />
        <span className={styles.skeleton} style={{ width: '75%' }} />
      </div>
    )
  }

  if (load.phase === 'error') {
    return (
      <div className={styles.padded}>
        <Alert
          tone="error"
          title="근거 코드를 불러오지 못했어요"
          action={
            <Button variant="ghost" size="sm" onClick={onRetry}>
              다시 시도
            </Button>
          }
        >
          파일 경로와 줄 번호는 파일 목록에서 볼 수 있어요.
        </Alert>
      </div>
    )
  }

  const { evidence } = load.detail
  if (evidence.length === 0) {
    return <p className={styles.empty}>이 저장소에서 관련 파일을 찾지 못했어요</p>
  }

  return (
    <>
      {provider.usage === 'declared-only' && (
        <p className={styles.note}>
          의존성에 {provider.name}가 있지만 코드에서 호출 위치를 찾지 못했어요. 간접 호출이거나 쓰지 않는 의존성일 수 있어요.
        </p>
      )}
      <ul>
        {evidence.map((item, index) => (
          <EvidenceItem key={`${item.path}:${item.line}:${item.reason.kind}`} evidence={item} primary={index === 0} />
        ))}
      </ul>
    </>
  )
}

/** 선택한 공급자의 근거 목록 (강한 근거 순) */
export function EvidencePanel({ provider, load, onRetry, title, footer, className }: EvidencePanelProps) {
  const count = load.phase === 'loaded' ? load.detail.evidence.length : null

  return (
    <Card className={[styles.panel, className].filter(Boolean).join(' ')} aria-label={`${provider.name} 근거`}>
      <CardHeader
        title={
          <>
            {title ?? `${provider.name} 근거`}
            {count !== null && <span className={styles.count}>{count}개 · 강한 근거 순</span>}
          </>
        }
      />
      <div className={styles.scroll}>
        <Body provider={provider} load={load} onRetry={onRetry} />
        {footer}
      </div>
    </Card>
  )
}
