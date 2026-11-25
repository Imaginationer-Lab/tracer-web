import type { Analysis } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import styles from './NoProvidersState.module.css'

interface NoProvidersStateProps {
  analysis: Analysis
  onAnalyzeOther: () => void
}

/** 지원하는 공급자를 하나도 찾지 못했을 때 */
export function NoProvidersState({ analysis, onAnalyzeOther }: NoProvidersStateProps) {
  const analyzed = analysis.result?.summary.analyzed ?? 0

  return (
    <Card dashed className={styles.card}>
      <Icon name="search" size={24} className={styles.icon} />
      <h2 className={styles.title}>지원하는 외부 서비스 단서를 찾지 못했어요</h2>
      <p className={styles.body}>
        지금은 JS·TS·Python·Java·C# 소스와 의존성·설정 파일에서 Supabase · Stripe · Amazon S3를 찾아요.
      </p>
      <p className={styles.meta}>
        분석한 파일 <code>{analyzed}</code>개 · 기준 커밋 <code>{analysis.repo.commit.slice(0, 7)}</code>
      </p>
      <Button className={styles.action} onClick={onAnalyzeOther}>
        다른 저장소 분석
      </Button>
    </Card>
  )
}
