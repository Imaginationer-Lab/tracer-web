import { useNavigate, useParams } from 'react-router'
import type { Analysis, AnalysisResult } from '../../api/contract'
import { paths } from '../../app/paths'
import { AppHeader } from '../../components/layout/AppHeader'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { useAnalysis } from '../../hooks/useAnalysis'
import { MOBILE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery'
import { useProviderDetail } from '../../hooks/useProviderDetail'
import { useProviderStatuses } from '../../hooks/useProviderStatuses'
import { DashboardError, DashboardLoading } from './components/DashboardMessage'
import { EvidencePanel } from './components/EvidencePanel'
import { EvidencePlaceholder } from './components/EvidencePlaceholder'
import { FileTreeCard } from './components/FileTreeCard'
import { NoProvidersState } from './components/NoProvidersState'
import { ProviderDetailMobile } from './components/ProviderDetailMobile'
import { ProviderList } from './components/ProviderList'
import { RepoInfo } from './components/RepoInfo'
import styles from './DashboardPage.module.css'
import { useProviderSelection } from './useProviderSelection'

const NO_PROVIDERS: AnalysisResult['providers'] = []

/** SCR-002 분석 대시보드 */
export function DashboardPage() {
  const { analysisId = '' } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const load = useAnalysis(analysisId)
  const analyzeOther = () => navigate(paths.home)

  const analysis = load.phase === 'error' ? null : load.analysis
  const result = load.phase === 'done' ? load.analysis.result : null
  const providers = result?.providers ?? NO_PROVIDERS

  const { statuses, refetch } = useProviderStatuses(providers)
  const { selected, select, backToList } = useProviderSelection(providers, isMobile)
  const detail = useProviderDetail(analysisId, selected?.id)

  // 모바일에서 공급자를 고르면 목록 대신 상세 화면
  if (isMobile && selected && result) {
    return (
      <ProviderDetailMobile
        provider={selected}
        statusLoad={statuses[selected.id]}
        detailLoad={detail.load}
        onRetryDetail={detail.retry}
        onBack={backToList}
      />
    )
  }

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
      {load.phase === 'done' && result && providers.length === 0 && (
        <main className={styles.centered}>
          <NoProvidersState analysis={load.analysis} onAnalyzeOther={analyzeOther} />
        </main>
      )}
      {load.phase === 'done' && result && providers.length > 0 && (
        <main className={styles.body}>
          <div className={styles.left}>
            <SkippedAlert analysis={load.analysis} />
            <ProviderList
              providers={providers}
              statuses={statuses}
              selectedId={selected?.id}
              onSelect={select}
              onRetryStatus={refetch}
            />
            <p className={styles.mobileHint}>서비스를 누르면 근거 파일과 코드를 볼 수 있어요.</p>
          </div>
          <div className={styles.right}>
            <FileTreeCard result={result} selected={selected} className={styles.tree} />
            {selected ? (
              <EvidencePanel
                key={selected.id}
                provider={selected}
                load={detail.load}
                onRetry={detail.retry}
                className={styles.evidence}
              />
            ) : (
              <EvidencePlaceholder className={styles.placeholder} />
            )}
          </div>
        </main>
      )}
    </div>
  )
}

function SkippedAlert({ analysis }: { analysis: Analysis }) {
  const skipped = analysis.result?.summary.skipped ?? 0
  if (skipped === 0) return null
  return (
    <Alert tone="warning" title="일부 파일을 읽지 못했어요">
      {skipped}개 파일을 건너뛰었어요. 아래 결과는 읽은 파일 기준이에요.
    </Alert>
  )
}
