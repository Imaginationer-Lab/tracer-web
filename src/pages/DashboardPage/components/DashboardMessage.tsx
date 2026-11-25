import type { ApiError } from '../../../api/contract'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { describeAnalysisError } from '../../../lib/analysisError'
import styles from './DashboardMessage.module.css'

/** 분석 결과를 기다리는 중 */
export function DashboardLoading() {
  return (
    <div className={styles.loading} role="status">
      <Spinner size={16} />
      분석 결과를 불러오고 있어요
    </div>
  )
}

interface DashboardErrorProps {
  error: ApiError
  onAnalyzeOther: () => void
}

/** 분석 결과를 볼 수 없을 때 (없는 분석, 분석 실패, 서버 오류) */
export function DashboardError({ error, onAnalyzeOther }: DashboardErrorProps) {
  const view =
    error.code === 'ANALYSIS_NOT_FOUND'
      ? { tone: 'error' as const, title: '분석 결과를 찾을 수 없어요', body: '저장소 주소를 다시 입력해 분석해 주세요.' }
      : describeAnalysisError(error)

  return (
    <div className={styles.error}>
      <Alert
        tone={view.tone}
        title={view.title}
        action={
          <Button variant="ghost" size="sm" onClick={onAnalyzeOther}>
            다른 저장소 분석
          </Button>
        }
      >
        {view.body}
      </Alert>
    </div>
  )
}
