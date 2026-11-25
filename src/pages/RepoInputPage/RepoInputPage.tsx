import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Analysis } from '../../api/contract'
import { EXAMPLE_REPO_URL } from '../../app/config'
import { paths } from '../../app/paths'
import { AppHeader } from '../../components/layout/AppHeader'
import { useAnalysisRunner } from '../../hooks/useAnalysisRunner'
import { isValidRepoUrl, normalizeRepoUrl } from '../../lib/repoUrl'
import { AnalysisErrorAlert } from './components/AnalysisErrorAlert'
import { AnalysisProgress } from './components/AnalysisProgress'
import { ExampleRepoCard } from './components/ExampleRepoCard'
import { RepoUrlForm } from './components/RepoUrlForm'
import styles from './RepoInputPage.module.css'

/** SCR-001 저장소 입력 */
export function RepoInputPage() {
  const navigate = useNavigate()
  const [repoUrl, setRepoUrl] = useState('')
  const [formatError, setFormatError] = useState(false)

  const handleDone = useCallback((analysis: Analysis) => navigate(paths.analysis(analysis.id)), [navigate])
  const { state, run, reset } = useAnalysisRunner(handleDone)

  const submit = () => {
    const url = normalizeRepoUrl(repoUrl)
    setRepoUrl(url)
    if (!isValidRepoUrl(url)) {
      // 형식이 틀리면 요청하지 않는다
      reset()
      setFormatError(true)
      return
    }
    setFormatError(false)
    void run(url)
  }

  const fillExample = () => {
    setRepoUrl(EXAMPLE_REPO_URL)
    setFormatError(false)
  }

  const loading = state.phase === 'running'
  // 서버가 형식 오류로 돌려보낸 경우도 입력란에서 안내한다
  const invalid = formatError || (state.phase === 'failed' && state.error.code === 'INVALID_REPO_URL')

  return (
    <div className={styles.page}>
      <AppHeader trailing={<span className={styles.meta}>공개 저장소 · 읽기 전용</span>} />
      <main className={styles.body}>
        <div className={styles.content}>
          <div className={styles.heading}>
            <h1 className={styles.title}>외부 서비스 장애 지도</h1>
            <p className={styles.description}>
              공개 GitHub 저장소가 쓰는 외부 서비스를 찾아, 공급자의 공개 상태와 코드의 호출 위치를 한 화면에 보여줍니다.
            </p>
          </div>

          <RepoUrlForm value={repoUrl} onChange={setRepoUrl} onSubmit={submit} loading={loading} invalid={invalid} />

          {state.phase === 'running' && <AnalysisProgress steps={state.analysis?.steps} />}

          {state.phase === 'failed' && !invalid && (
            <div className={styles.feedback}>
              {state.analysis && <AnalysisProgress steps={state.analysis.steps} failed />}
              <AnalysisErrorAlert key={state.attempt} error={state.error} onRetry={submit} />
            </div>
          )}

          {(state.phase === 'idle' || invalid) && (
            <>
              <ExampleRepoCard onUse={fillExample} />
              <p className={styles.support}>
                현재 탐지: Supabase · Stripe · Amazon S3 — JS·TS·Python·Java·C# 소스와 의존성·설정 파일 기준
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
