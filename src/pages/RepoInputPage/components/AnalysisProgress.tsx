import type { StepKey, StepState } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { Spinner } from '../../../components/ui/Spinner'
import styles from './AnalysisProgress.module.css'

const STEP_LABELS: Record<StepKey, string> = {
  repo: '저장소와 기본 브랜치 확인',
  files: '분석할 파일 목록 읽기',
  detect: '외부 서비스 단서 찾기',
}

/** POST 응답 전에는 저장소 확인 단계가 진행 중인 것으로 보여준다 */
const INITIAL_STEPS: { key: StepKey; state: StepState }[] = [
  { key: 'repo', state: 'running' },
  { key: 'files', state: 'pending' },
  { key: 'detect', state: 'pending' },
]

interface AnalysisProgressProps {
  steps?: { key: StepKey; state: StepState }[]
  /** 분석이 status: failed로 끝났을 때 */
  failed?: boolean
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') return <Icon name="check" size={14} className={styles.done} />
  if (state === 'failed') return <Icon name="alert" size={14} className={styles.failedIcon} />
  if (state === 'running') return <Spinner size={14} className={styles.running} />
  return <span className={styles.dot} aria-hidden="true" />
}

export function AnalysisProgress({ steps = INITIAL_STEPS, failed = false }: AnalysisProgressProps) {
  return (
    <section className={styles.card} aria-live="polite">
      <h2 className={styles.title}>{failed ? '분석을 마치지 못했어요' : '저장소를 분석하고 있어요'}</h2>
      <ol className={styles.steps}>
        {steps.map(({ key, state }) => (
          <li key={key} className={styles.step} data-state={state}>
            <StepIcon state={state} />
            <span>
              {STEP_LABELS[key]}
              {state === 'failed' && ' · 실패'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
