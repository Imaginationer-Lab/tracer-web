import type { OtherServiceSummary } from '../../../api/contract'
import { DashedBadge } from '../../../components/ui/DashedBadge'
import { MobileDetailLayout } from './MobileDetailLayout'
import { OtherServicePanel } from './OtherServicePanel'
import { RelatedFiles } from './RelatedFiles'

interface OtherServiceDetailMobileProps {
  service: OtherServiceSummary
  onBack: () => void
}

/** 모바일: 그 밖의 외부 서비스(AI 판단)를 누르면 열리는 상세 화면 */
export function OtherServiceDetailMobile({ service, onBack }: OtherServiceDetailMobileProps) {
  return (
    <MobileDetailLayout
      title={service.name}
      onBack={onBack}
      status={
        <>
          <DashedBadge>AI 판단</DashedBadge>
          <span>상태 연동 없음</span>
        </>
      }
    >
      <OtherServicePanel service={service} showTitle={false} footer={<RelatedFiles files={service.files} />} />
    </MobileDetailLayout>
  )
}
