import { useMemo, useState } from 'react'
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
import { useDemoEvent } from '../../hooks/useDemoEvent'
import { isExampleRepo } from '../../lib/exampleRepo'
import { buildResponseGuide } from '../../lib/responseGuide'
import { findSameCategory, type SameCategory } from '../../lib/sameCategory'
import { DashboardError, DashboardLoading } from './components/DashboardMessage'
import { DemoEventArea } from './components/DemoEventArea'
import { DemoToggle } from './components/DemoToggle'
import { EvidencePanel, type EvidenceReveal } from './components/EvidencePanel'
import { EvidencePlaceholder } from './components/EvidencePlaceholder'
import { FileTreeCard, type FileHighlight } from './components/FileTreeCard'
import { NoProvidersState } from './components/NoProvidersState'
import { ProviderDetailMobile } from './components/ProviderDetailMobile'
import { ProviderList } from './components/ProviderList'
import { RepoInfo } from './components/RepoInfo'
import { ResponseGuide } from './components/ResponseGuide'
import { SameCategoryNote } from './components/SameCategoryNote'
import styles from './DashboardPage.module.css'
import { useDemoMode } from './useDemoMode'
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
  const { selected, selectProvider, backToList } = useProviderSelection(providers, isMobile)
  const detail = useProviderDetail(analysisId, selected?.id)
  const same = useMemo(() => (selected ? findSameCategory(selected, providers) : null), [selected, providers])
  // 데모 재현은 시연용 장치라 공개 예제 저장소에서만 쓴다 (다른 저장소에서는 ?demo=1 이 있어도 무시)
  const isExample = analysis !== null && isExampleRepo(analysis.repo)
  const demo = useDemoMode()
  const demoLoad = useDemoEvent(demo.enabled && isExample && result !== null)
  const event = demoLoad.phase === 'loaded' ? demoLoad.event : null
  const replayStatus = event && selected?.id === event.providerId ? event.httpStatus : undefined

  // 대응 가이드: 재현 중이고, 이벤트의 공급자를 골랐고, 근거를 불러왔을 때만
  const guideShown = Boolean(event && selected?.id === event.providerId && detail.load.phase === 'loaded')
  const guide =
    guideShown && event && selected && detail.load.phase === 'loaded' ? (
      <ResponseGuide guide={buildResponseGuide(event, selected, detail.load.detail, same)} />
    ) : null
  const highlight = useMemo<FileHighlight | undefined>(() => {
    if (!selected) return undefined
    // 가이드가 같은 분류 서비스를 검토 항목으로 꺼냈을 때만 트리에도 그 파일을 보조 표시한다
    const marks = guideShown && same ? sameCategoryMarks(same) : undefined
    return { key: `provider:${selected.id}${marks ? ':guide' : ''}`, label: selected.name, files: selected.files, marks }
  }, [selected, same, guideShown])
  const sameNote = same && <SameCategoryNote same={same} onSelect={selectProvider} />

  // 파일 트리에서 칩이 달린 파일을 누르면: 관련 파일은 근거 카드로, 같은 분류 파일은 그 서비스로
  const [reveal, setReveal] = useState<(EvidenceReveal & { providerId: string }) | null>(null)
  // 다른 서비스로 바꾸면 잊는다 (돌아왔을 때 예전 파일로 다시 스크롤하지 않게)
  if (reveal && reveal.providerId !== selected?.id) setReveal(null)
  const openFile = (path: string) => {
    if (!selected) return
    if (selected.files.some((file) => file.path === path)) {
      setReveal((prev) => ({ providerId: selected.id, path, seq: (prev?.seq ?? 0) + 1 }))
      return
    }
    const owner = same?.services.find((service) => service.files.some((file) => file.path === path))
    if (owner) selectProvider(owner.id)
  }
  const demoArea = <DemoEventArea load={demoLoad} providers={providers} onTurnOff={() => demo.setEnabled(false)} />
  const demoToggle = (variant: 'header' | 'bar') =>
    result && isExample && <DemoToggle enabled={demo.enabled} onChange={demo.setEnabled} variant={variant} />

  // 모바일에서 서비스를 고르면 목록 대신 상세 화면
  if (isMobile && selected && result) {
    return (
      <ProviderDetailMobile
        provider={selected}
        statusLoad={statuses[selected.id]}
        detailLoad={detail.load}
        onRetryDetail={detail.retry}
        onBack={backToList}
        demoEvent={event?.providerId === selected.id ? demoArea : null}
        replayStatus={replayStatus}
        sameCategory={sameNote}
        guide={guide}
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
          <>
            {demoToggle('header')}
            <Button variant="ghost" size="sm" onClick={analyzeOther}>
              <span className={styles.desktopOnly}>다른 저장소 분석</span>
              <span className={styles.mobileOnly}>다른 저장소</span>
            </Button>
          </>
        }
      />
      {analysis && (
        <div className={styles.repoBar}>
          <RepoInfo repo={analysis.repo} />
          {demoToggle('bar')}
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
            {demoArea}
            <SkippedAlert analysis={load.analysis} />
            <ProviderList
              providers={providers}
              statuses={statuses}
              selectedId={selected?.id}
              replay={event ? { providerId: event.providerId, httpStatus: event.httpStatus } : undefined}
              onSelect={selectProvider}
              onRetryStatus={refetch}
            />
            <p className={styles.mobileHint}>서비스를 누르면 근거 파일과 코드를 볼 수 있어요.</p>
          </div>
          <div className={styles.right}>
            <FileTreeCard result={result} highlight={highlight} onFileClick={openFile} className={styles.tree} />
            {selected ? (
              <EvidencePanel
                key={selected.id}
                provider={selected}
                load={detail.load}
                onRetry={detail.retry}
                reveal={reveal?.providerId === selected.id ? reveal : undefined}
                replayStatus={replayStatus}
                footer={
                  <>
                    {sameNote}
                    {guide}
                  </>
                }
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

function sameCategoryMarks(same: SameCategory) {
  return same.services.flatMap((service) =>
    service.files.map((file) => ({ path: file.path, label: `같은 분류 · ${file.line}행` })),
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
