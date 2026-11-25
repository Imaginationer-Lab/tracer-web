// 백엔드 POST /analyses 와 같은 규칙. .git, 끝 슬래시, /tree/main/src 같은 하위 경로도 받는다.
const REPO_URL_PATTERN = /^https:\/\/github\.com\/[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}(\.git)?(\/.*)?$/

export function normalizeRepoUrl(input: string): string {
  return input.trim()
}

export function isValidRepoUrl(url: string): boolean {
  return REPO_URL_PATTERN.test(url)
}
