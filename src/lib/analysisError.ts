import type { ApiError } from '../api/contract'
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

const KEEP_INPUT = '입력한 주소는 그대로 두었어요.'

/** 분석 오류(요청 실패 또는 status: failed)를 SCR-001 알림 문구로 바꾼다. 문구는 figdora 시안을 따른다. */
export function describeAnalysisError(error: ApiError): AnalysisErrorView {
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
        body: `${KEEP_INPUT} 잠시 후 다시 시도해 주세요.`,
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
    default:
      return {
        tone: 'error',
        title: '일시적인 서버 오류가 났어요',
        body: error.message || `${KEEP_INPUT} 잠시 후 다시 시도해 주세요.`,
        retry: error.retryable ? 'now' : 'none',
      }
  }
}
