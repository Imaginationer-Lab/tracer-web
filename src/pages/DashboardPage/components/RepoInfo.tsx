import type { RepoRef } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import styles from './RepoInfo.module.css'

interface RepoInfoProps {
  repo: RepoRef
  className?: string
}

/** 저장소 owner/name 과 기준 브랜치 · 커밋 7자리 */
export function RepoInfo({ repo, className }: RepoInfoProps) {
  return (
    <div className={[styles.info, className].filter(Boolean).join(' ')}>
      <span className={styles.repo}>
        <Icon name="repo" size={14} className={styles.icon} />
        <span className={styles.name}>
          {repo.owner}/{repo.name}
        </span>
      </span>
      <span className={styles.branch} title={repo.commit}>
        <Icon name="branch" size={12} className={styles.icon} />
        {repo.branch} · {repo.commit.slice(0, 7)}
      </span>
    </div>
  )
}
