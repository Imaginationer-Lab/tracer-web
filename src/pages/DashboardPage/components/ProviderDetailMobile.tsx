import type { ReactNode } from 'react'
import type { ProviderSummary } from '../../../api/contract'
import { StatusPill } from '../../../components/ui/StatusPill'
import type { ProviderDetailLoad } from '../../../hooks/useProviderDetail'
import { describeProviderStatus, type ProviderStatusLoad } from '../../../lib/providerStatus'
import { EvidencePanel } from './EvidencePanel'
import { MobileDetailLayout } from './MobileDetailLayout'
import { RelatedFiles } from './RelatedFiles'

interface ProviderDetailMobileProps {
  provider: ProviderSummary
  statusLoad: ProviderStatusLoad | undefined
  detailLoad: ProviderDetailLoad
  onRetryDetail: () => void
  onBack: () => void
  /** 데모 재현 이벤트 카드 (재현 중이고 이 공급자의 이벤트일 때) */
  demoEvent?: ReactNode
  /** 데모 재현 이벤트의 HTTP 코드 (이 공급자의 이벤트일 때) */
  replayStatus?: number
  /** 같은 분류 서비스 (관련 파일 아래) */
  sameCategory?: ReactNode
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
  replayStatus,
  sameCategory,
  guide,
}: ProviderDetailMobileProps) {
  const status = describeProviderStatus(provider, statusLoad)

  return (
    <MobileDetailLayout
      title={provider.name}
      subtitle={provider.role}
      onBack={onBack}
      status={
        <>
          <StatusPill label={status.label} tone={status.tone} marker={status.marker} />
          <span>{status.meta}</span>
        </>
      }
    >
      {demoEvent}
      <EvidencePanel
        provider={provider}
        load={detailLoad}
        onRetry={onRetryDetail}
        title="근거"
        replayStatus={replayStatus}
        footer={
          <>
            <RelatedFiles files={provider.files} />
            {sameCategory}
            {guide}
          </>
        }
      />
    </MobileDetailLayout>
  )
}
