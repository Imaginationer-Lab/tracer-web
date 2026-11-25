import type { ApiError } from '../../../api/contract'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { useCountdown } from '../../../hooks/useCountdown'
import { describeAnalysisError } from '../../../lib/analysisError'

interface AnalysisErrorAlertProps {
  error: ApiError
  onRetry: () => void
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function RetryButton({ waitSeconds, onRetry }: { waitSeconds: number; onRetry: () => void }) {
  const remaining = useCountdown(waitSeconds)
  return (
    <Button variant="ghost" size="sm" onClick={onRetry} disabled={remaining > 0}>
      {remaining > 0 ? `다시 시도 · ${formatCountdown(remaining)}` : '다시 시도'}
    </Button>
  )
}

/**
 * 조회 오류 알림. 다시 시도 버튼은 retryable일 때만, 요청 제한이면 남은 시간이 지나야 눌린다.
 * 새 오류마다 카운트다운을 다시 세도록 부모에서 key를 바꿔 준다.
 */
export function AnalysisErrorAlert({ error, onRetry }: AnalysisErrorAlertProps) {
  const view = describeAnalysisError(error)
  const action =
    view.retry === 'none' ? undefined : (
      <RetryButton waitSeconds={view.retry === 'countdown' ? (view.retryAfterSeconds ?? 0) : 0} onRetry={onRetry} />
    )

  return (
    <Alert tone={view.tone} title={view.title} action={action}>
      {view.body}
    </Alert>
  )
}
