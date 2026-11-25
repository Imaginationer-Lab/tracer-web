// 백엔드 응답 계약. tracer-backend의 src/api/contract.ts를 그대로 복사한 파일이다 (기준 커밋 f71c2f5, 브랜치 feat/selective-fetch).
// 직접 고치지 말고, 백엔드가 바뀌면 다시 복사한다. 명세: tracer-backend docs/frontend-handoff.md

/** 서비스 id. 소문자·숫자·하이픈 (예: supabase, stripe, aws-s3, toss-payments). 탐지되는 서비스는 고정되어 있지 않다 */
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
  | 'DETECTION_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface ApiError {
  code: ErrorCode;
  message: string;
  retryable: boolean;
  /** GITHUB_RATE_LIMITED: GitHub 요청 한도가 풀리는 시각 */
  resetAt?: string;
  /** RATE_LIMITED: 다시 시도할 수 있을 때까지 남은 초 (Retry-After 헤더와 같음) */
  retryAfter?: number;
}

/** 기계가 읽는 서비스 분류 (role은 화면용 한국어 라벨). 나중에 늘 수 있으니 모르는 값은 'other'로 취급한다 */
export type ProviderCategory = 'auth' | 'payment' | 'storage' | 'database' | 'ai' | 'messaging' | 'monitoring' | 'analytics' | 'other';

export interface ProviderSummary {
  id: ProviderId;
  name: string;
  /** 화면용 한국어 라벨 (예: 로그인, 결제, 파일 업로드, 에러 모니터링). 알려진 서비스가 아니면 AI가 붙인다 */
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
  /** 탐지된 모든 외부 서비스. Supabase → Stripe → Amazon S3 → 나머지는 근거 파일이 많은 순 → 이름순 */
  providers: ProviderSummary[];
  /** @deprecated 항상 []. 모든 서비스가 providers로 들어간다. 다음 변경 때 지운다 */
  otherServices: never[];
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
