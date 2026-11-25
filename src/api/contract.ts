// 백엔드 응답 계약. tracer-backend의 src/api/contract.ts를 그대로 복사한 파일이다 (기준 커밋 2893ba6).
// 직접 고치지 말고, 백엔드가 바뀌면 다시 복사한다. 명세: tracer-backend docs/frontend-handoff.md
// 임시: AI 탐지 전환 부분(ProviderId · ProviderCategory · otherServices · DETECTION_UNAVAILABLE)은
// 백엔드 예고 문서 api-change-ai-detection.md(2026-11-25)의 타입을 먼저 옮겼다. 백엔드 구현이 나오면 다시 복사한다.

/** 서비스 id. 소문자·숫자·하이픈. supabase · stripe · aws-s3 는 지금과 같다 */
export type ProviderId = string;

export type StepKey = 'repo' | 'files' | 'detect';
export type StepState = 'pending' | 'running' | 'done' | 'failed';

export interface RepoRef {
  owner: string;
  name: string;
  branch: string;
  commit: string;
}

export type ErrorCode =
  | 'INVALID_REPO_URL'
  | 'REPO_NOT_ACCESSIBLE'
  | 'REPO_TOO_LARGE'
  | 'GITHUB_RATE_LIMITED'
  | 'GITHUB_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'ANALYSIS_NOT_FOUND'
  | 'ANALYSIS_NOT_READY'
  | 'PROVIDER_NOT_FOUND'
  | 'STATUS_NOT_SUPPORTED'
  | 'STATUS_UNAVAILABLE'
  | 'DEMO_EVENT_INVALID'
  | 'ORIGIN_NOT_ALLOWED'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'DETECTION_UNAVAILABLE'; // 503, retryable: AI 판단 실패 (분석은 status: 'failed', error에 담김)

export interface ApiError {
  code: ErrorCode;
  message: string;
  retryable: boolean;
  /** GITHUB_RATE_LIMITED: GitHub 요청 한도가 풀리는 시각 */
  resetAt?: string;
  /** RATE_LIMITED: 다시 시도할 수 있을 때까지 남은 초 (Retry-After 헤더와 같음) */
  retryAfter?: number;
}

/** 아이콘·색 고르기용. 모르는 값이 오면 'other'로 취급한다 */
export type ProviderCategory =
  | 'auth'        // 로그인·인증
  | 'payment'     // 결제
  | 'storage'     // 파일 저장·업로드
  | 'database'    // 데이터베이스·BaaS
  | 'ai'          // AI 모델·검색 API
  | 'messaging'   // 메일·SMS·푸시 알림·채팅
  | 'monitoring'  // 에러 추적·로그
  | 'analytics'   // 사용자 분석·광고
  | 'other';      // 지도, 외부 데이터 API 등

export interface ProviderSummary {
  id: ProviderId;
  name: string;
  /** AI가 붙인 짧은 한국어 라벨 (예: 결제, 에러 모니터링, AI 모델 호출) */
  role: string;
  category: ProviderCategory;
  fileCount: number;
  /** 공급자별 근거 파일 (파일마다 대표 줄 하나, 강한 근거 순). 기능정의서 providers[].files[].path, line */
  files: { path: string; line: number }[];
  /** declared-only: 의존성 선언만 있고 코드에서 쓰는 곳은 못 찾음 */
  usage: 'used' | 'declared-only';
  statusSupport: 'live' | 'none';
}

export type SkipReason = 'too-large' | 'minified' | 'parse-error';

export type FileEntry =
  | { path: string; state: 'analyzed'; matches: { provider: ProviderId; line: number }[] }
  | { path: string; state: 'skipped'; reason: SkipReason }
  | { path: string; state: 'other' };

export interface AnalysisResult {
  /** 모든 외부 서비스. 순서: Supabase → Stripe → Amazon S3 → 근거 파일이 많은 순 → 이름순 */
  providers: ProviderSummary[];
  /** @deprecated 항상 []. 다음 변경 때 지운다 */
  otherServices: [];
  files: FileEntry[];
  summary: { analyzed: number; skipped: number };
}

export interface Analysis {
  id: string;
  status: 'running' | 'done' | 'failed';
  repo: RepoRef;
  steps: { key: StepKey; state: StepState }[];
  error: ApiError | null;
  result: AnalysisResult | null;
}

export type EvidenceKind = 'call' | 'http' | 'import' | 'type' | 'setting' | 'config' | 'url' | 'manifest' | 'llm';

export interface CodeFacts {
  /** try/catch, .catch(), except 등으로 감싸져 있는지 */
  errorHandling: boolean;
  retry: boolean;
  timeout: boolean;
  /** 응답 상태 코드를 확인하는지 (res.ok, raise_for_status, IsSuccessStatusCode 등) */
  statusCheck: boolean;
}

export interface EvidenceItem {
  path: string;
  line: number;
  language: string;
  reason: { kind: EvidenceKind; label: string };
  snippet: { startLine: number; lines: string[] };
  facts: CodeFacts | null;
  /** 코드에서 식별한 API 엔드포인트 (host로 판정한 근거만). '*'는 동적인 부분. SDK 호출이면 null */
  endpoint: { host: string; path?: string } | null;
}

export interface ProviderDetail {
  provider: { id: ProviderId; name: string; statusPageUrl: string | null };
  evidence: EvidenceItem[];
}

export interface ProviderStatus {
  providerId: ProviderId;
  /** 공식 상태 JSON의 status.indicator 원래 값 (none · minor · major · critical · maintenance) */
  indicator: string;
  state: 'operational' | 'degraded' | 'outage' | 'maintenance' | 'unknown';
  description: string;
  fetchedAt: string;
}

export interface DemoEvent {
  providerId: ProviderId;
  title: string;
  httpStatus: number;
  occurredAt: string;
}
