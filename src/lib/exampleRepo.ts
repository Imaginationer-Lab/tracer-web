import type { RepoRef } from '../api/contract'
import { EXAMPLE_REPO_URL } from '../app/config'
import { parseRepoUrl } from './repoUrl'

const example = parseRepoUrl(EXAMPLE_REPO_URL)

/** 분석한 저장소가 공개 예제 저장소인지 (GitHub 이름은 대소문자를 구분하지 않는다) */
export function isExampleRepo(repo: Pick<RepoRef, 'owner' | 'name'>): boolean {
  return (
    example !== null &&
    repo.owner.toLowerCase() === example.owner.toLowerCase() &&
    repo.name.toLowerCase() === example.name.toLowerCase()
  )
}
