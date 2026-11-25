import type { ReactNode } from 'react'
import type { ProviderSummary } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { StatusPill } from '../../../components/ui/StatusPill'
import type { ProviderDetailLoad } from '../../../hooks/useProviderDetail'
import { describeProviderStatus, type ProviderStatusLoad } from '../../../lib/providerStatus'
import { EvidencePanel } from './EvidencePanel'
import styles from './ProviderDetailMobile.module.css'
import { RelatedFiles } from './RelatedFiles'

interface ProviderDetailMobileProps {
  provider: ProviderSummary
  statusLoad: ProviderStatusLoad | undefined
  detailLoad: ProviderDetailLoad
  onRetryDetail: () => void
  onBack: () => void
  /** 데모 재현 이벤트 카드 (재현 중이고 이 공급자의 이벤트일 때) */
  demoEvent?: ReactNode
  /** 대응 가이드 (관련 파일 아래) */
  guide?: ReactNode
}

/** 모바일: 목록에서 공급자를 누르면 열리는 상세 화면 (세로 스크롤) */
export function ProviderDetailMobile({
  provider,
  statusLoad,
  detailLoad,
  onRetryDetail,
  onBack,
  demoEvent,
  guide,
}: ProviderDetailMobileProps) {
  const status = describeProviderStatus(provider, statusLoad)

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
            {provider.name}
            <span className={styles.role}>{provider.role}</span>
          </h1>
          <div className={styles.status}>
            <StatusPill label={status.label} tone={status.tone} marker={status.marker} />
            <span>{status.meta}</span>
          </div>
        </header>
        {demoEvent}
        <EvidencePanel
          provider={provider}
          load={detailLoad}
          onRetry={onRetryDetail}
          title="근거"
          footer={
            <>
              <RelatedFiles provider={provider} />
              {guide}
            </>
          }
        />
      </main>
    </div>
  )
}
