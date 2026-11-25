import type { AppError } from '../api/client'
import { formatKstTime } from './time'

export type AlertTone = 'error' | 'warning'

export interface AnalysisErrorView {
  tone: AlertTone
  title: string
  body: string
  /** now: 바로 다시 시도 · countdown: retryAfter초 뒤 다시 시도 · none: 버튼 없음 */
  retry: 'now' | 'countdown' | 'none'
  retryAfterSeconds?: number
}

interface DescribeOptions {
  /** SCR-001처럼 입력란이 있는 화면이면 "입력한 주소는 그대로 두었어요"를 붙인다 */
  keepInputNote?: boolean
}

const CLIENT_TITLES = {
  unreachable: '서버에 연결하지 못했어요',
  timeout: '분석이 오래 걸리고 있어요',
  unknown: '알 수 없는 오류가 났어요',
} as const

/**
 * 분석 오류(요청 실패 또는 status: failed)를 알림 문구로 바꾼다. 문구는 figdora 시안을 따른다.
 * 제목과 본문이 같은 말을 반복하지 않게, 본문에는 "무엇을 하면 되는지"만 쓴다.
 */
export function describeAnalysisError(error: AppError, { keepInputNote = true }: DescribeOptions = {}): AnalysisErrorView {
  const retryLater = `${keepInputNote ? '입력한 주소는 그대로 두었어요. ' : ''}잠시 후 다시 시도해 주세요.`

  // 프론트가 만든 오류 (서버에 닿지 못함 · 시간 초과 · 알 수 없음)
  if (error.clientKind) {
    return { tone: 'error', title: CLIENT_TITLES[error.clientKind], body: retryLater, retry: 'now' }
  }

  switch (error.code) {
    case 'REPO_NOT_ACCESSIBLE':
      return {
        tone: 'error',
        title: '저장소에 접근할 수 없어요',
        body: '비공개 저장소이거나 없는 주소예요. 공개 저장소 주소인지 확인해 주세요.',
        retry: 'none',
      }
    case 'GITHUB_RATE_LIMITED':
      return {
        tone: 'warning',
        title: 'GitHub 요청 한도에 도달했어요',
        body: error.resetAt
          ? `공개 API 요청 한도가 ${formatKstTime(error.resetAt)}에 초기화돼요. 그 이후에 다시 분석해 주세요.`
          : '공개 API 요청 한도가 초기화된 뒤에 다시 분석해 주세요.',
        retry: 'none',
      }
    case 'GITHUB_UNAVAILABLE':
      return {
        tone: 'error',
        title: 'GitHub에 일시적으로 연결하지 못했어요',
        body: retryLater,
        retry: 'now',
      }
    case 'RATE_LIMITED':
      return {
        tone: 'warning',
        title: '새 분석 요청이 많아요',
        body: '같은 곳에서 짧은 시간에 분석을 여러 번 요청했어요. 잠시 뒤에 다시 시도할 수 있어요.',
        retry: 'countdown',
        retryAfterSeconds: error.retryAfter ?? 60,
      }
    case 'REPO_TOO_LARGE':
      return {
        tone: 'error',
        title: '저장소가 너무 커서 분석하지 못했어요',
        body: '파일 수나 용량이 분석 상한을 넘었어요. 더 작은 저장소로 시도해 주세요.',
        retry: 'none',
      }
    case 'INTERNAL_ERROR':
      return {
        tone: 'error',
        title: '일시적인 서버 오류가 났어요',
        body: retryLater,
        retry: error.retryable ? 'now' : 'none',
      }
    default:
      // 그 밖의 코드는 백엔드가 준 화면용 문구를 그대로 쓴다
      return {
        tone: 'error',
        title: '요청을 처리하지 못했어요',
        body: error.message || retryLater,
        retry: error.retryable ? 'now' : 'none',
      }
  }
}
