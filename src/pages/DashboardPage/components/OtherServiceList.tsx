import type { OtherServiceSummary } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { Card, CardHeader } from '../../../components/ui/Card'
import { DashedBadge } from '../../../components/ui/DashedBadge'
import styles from './OtherServiceList.module.css'
import rowStyles from './ProviderRow.module.css'

interface OtherServiceListProps {
  services: OtherServiceSummary[]
  selectedName: string | undefined
  onSelect: (name: string) => void
}

/**
 * 세 공급자 밖에서 AI가 찾은 외부 서비스. 확정이 아니므로 점선 "AI 판단" 배지를 붙이고,
 * 상태 연동이 없으니 상태 배지 대신 "상태 연동 없음"을 쓴다. 비어 있으면 그리지 않는다.
 */
export function OtherServiceList({ services, selectedName, onSelect }: OtherServiceListProps) {
  if (services.length === 0) return null

  return (
    <Card>
      <CardHeader
        title={
          <>
            그 밖의 외부 서비스
            <DashedBadge>AI 판단</DashedBadge>
          </>
        }
        aside={<span className={styles.count}>{services.length}</span>}
      />
      <ul>
        {services.map((service) => {
          const selected = service.name === selectedName
          return (
            <li key={service.name} className={rowStyles.row} data-selected={selected || undefined}>
              <button
                type="button"
                className={rowStyles.select}
                onClick={() => onSelect(service.name)}
                aria-pressed={selected}
                aria-label={`${service.name} 근거 파일 보기 (AI 판단)`}
              />
              <div className={rowStyles.main}>
                <div className={rowStyles.top}>
                  <strong className={styles.name}>{service.name}</strong>
                  <span className={styles.noStatus}>상태 연동 없음</span>
                </div>
                <div className={styles.meta}>
                  <span>근거 파일 {service.fileCount}개</span>
                  <code className={styles.clues}>{service.clues.join(' · ')}</code>
                </div>
              </div>
              <Icon name="chevronRight" size={16} className={rowStyles.chevron} />
            </li>
          )
        })}
      </ul>
      <p className={styles.footnote}>규칙으로 찾지 못한 단서를 AI가 판단했어요. 확정이 아니에요.</p>
    </Card>
  )
}
