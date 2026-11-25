// 백엔드 POST /analyses 와 같은 규칙. .git, 끝 슬래시, /tree/main/src 같은 하위 경로도 받는다.
const REPO_URL_PATTERN = /^https:\/\/github\.com\/[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}(\.git)?(\/.*)?$/

export function normalizeRepoUrl(input: string): string {
  return input.trim()
}

export function isValidRepoUrl(url: string): boolean {
  return REPO_URL_PATTERN.test(url)
}

/** github.com/{owner}/{repo} 주소에서 owner·repo를 뽑는다 (.git, 하위 경로는 무시) */
export function parseRepoUrl(url: string): { owner: string; name: string } | null {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/.exec(url.trim())
  return match ? { owner: match[1], name: match[2] } : null
}
