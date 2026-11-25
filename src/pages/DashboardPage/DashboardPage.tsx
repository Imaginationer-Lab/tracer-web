import { useNavigate, useParams } from 'react-router'
import type { Analysis, AnalysisResult } from '../../api/contract'
import { paths } from '../../app/paths'
import { AppHeader } from '../../components/layout/AppHeader'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { useAnalysis } from '../../hooks/useAnalysis'
import { useProviderStatuses } from '../../hooks/useProviderStatuses'
import { DashboardError, DashboardLoading } from './components/DashboardMessage'
import { EvidencePlaceholder } from './components/EvidencePlaceholder'
import { FileTreeCard } from './components/FileTreeCard'
import { NoProvidersState } from './components/NoProvidersState'
import { ProviderList } from './components/ProviderList'
import { RepoInfo } from './components/RepoInfo'
import styles from './DashboardPage.module.css'

/** SCR-002 분석 대시보드 */
export function DashboardPage() {
  const { analysisId = '' } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()
  const load = useAnalysis(analysisId)
  const analyzeOther = () => navigate(paths.home)

  const analysis = load.phase === 'done' ? load.analysis : load.phase === 'loading' ? load.analysis : null

  return (
    <div className={styles.page}>
      <AppHeader
        leading={
          analysis && (
            <div className={styles.headerRepo}>
              <span className={styles.slash} aria-hidden="true">
                /
              </span>
              <RepoInfo repo={analysis.repo} />
            </div>
          )
        }
        trailing={
          <Button variant="ghost" size="sm" onClick={analyzeOther}>
            <span className={styles.desktopOnly}>다른 저장소 분석</span>
            <span className={styles.mobileOnly}>다른 저장소</span>
          </Button>
        }
      />
      {analysis && (
        <div className={styles.repoBar}>
          <RepoInfo repo={analysis.repo} />
        </div>
      )}

      {load.phase === 'loading' && <DashboardLoading />}
      {load.phase === 'error' && <DashboardError error={load.error} onAnalyzeOther={analyzeOther} />}
      {load.phase === 'done' && <DashboardBody analysis={load.analysis} onAnalyzeOther={analyzeOther} />}
    </div>
  )
}

interface DashboardBodyProps {
  analysis: Analysis
  onAnalyzeOther: () => void
}

function DashboardBody({ analysis, onAnalyzeOther }: DashboardBodyProps) {
  const result = analysis.result as AnalysisResult
  const { statuses, refetch } = useProviderStatuses(result.providers)

  if (result.providers.length === 0) {
    return (
      <main className={styles.centered}>
        <NoProvidersState analysis={analysis} onAnalyzeOther={onAnalyzeOther} />
      </main>
    )
  }

  return (
    <main className={styles.body}>
      <div className={styles.left}>
        {result.summary.skipped > 0 && (
          <Alert tone="warning" title="일부 파일을 읽지 못했어요">
            {result.summary.skipped}개 파일을 건너뛰었어요. 아래 결과는 읽은 파일 기준이에요.
          </Alert>
        )}
        <ProviderList providers={result.providers} statuses={statuses} onRetryStatus={refetch} />
      </div>
      <div className={styles.right}>
        <FileTreeCard result={result} className={styles.tree} />
        <EvidencePlaceholder className={styles.evidence} />
      </div>
    </main>
  )
}
