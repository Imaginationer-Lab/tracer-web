import type { Alternative, UsedFeature } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { StatusPill } from '../../../components/ui/StatusPill'
import { coverageRows, formatLocation } from '../../../lib/alternatives'
import { describeProviderStatus, type ProviderStatusLoad } from '../../../lib/providerStatus'
import { CodeLocationLink } from './CodeLocationLink'
import styles from './AlternativeCard.module.css'

/** 고칠 파일은 이 개수까지 보이고 나머지는 '외 N개' */
const MAX_FILES = 3

interface AlternativeCardProps {
  alternative: Alternative
  features: UsedFeature[]
  /** statusSupport가 live일 때의 공식 상태 */
  statusLoad: ProviderStatusLoad | undefined
  /** 근거로 이동할 수 있는 파일이면 이동 함수를, 아니면 undefined를 돌려준다 */
  fileOpener: (path: string) => ((path: string) => void) | undefined
}

/** 대체 서비스 후보 하나 (AI 제안) */
export function AlternativeCard({ alternative, features, statusLoad, fileOpener }: AlternativeCardProps) {
  const rows = coverageRows(alternative, features)
  const { settings, files } = alternative.changes
  const shownFiles = files.slice(0, MAX_FILES)
  const status = alternative.statusSupport === 'live' ? describeProviderStatus(alternative, statusLoad) : null

  return (
    <li className={styles.card}>
      <div className={styles.top}>
        <span className={styles.name}>{alternative.name}</span>
        <span className={styles.fit}>{alternative.fitLabel}</span>
        {status && <StatusPill label={status.label} tone={status.tone} marker={status.marker} className={styles.status} />}
      </div>
      <p className={styles.summary}>{alternative.summary}</p>

      {rows.length > 0 && (
        <ul className={styles.coverage} aria-label="쓰는 기능 지원 여부">
          {rows.map((row) => (
            <li key={row.key} className={styles.row}>
              <span className={[styles.support, styles[row.support.tone]].join(' ')}>
                <Icon name={row.support.icon} size={12} className={styles.supportIcon} />
                {row.support.label}
              </span>
              <span className={styles.feature}>{row.label}</span>
              {row.note && <span className={styles.note}>{row.note}</span>}
            </li>
          ))}
        </ul>
      )}

      <dl className={styles.changes}>
        {settings.length > 0 && (
          <div className={styles.change}>
            <dt>바꿀 설정</dt>
            <dd className={styles.mono}>{settings.join(' · ')}</dd>
          </div>
        )}
        <div className={styles.change}>
          <dt>고칠 파일</dt>
          {files.length === 0 ? (
            <dd>없음 · 설정만 바꿔요</dd>
          ) : (
            <dd className={styles.files}>
              {shownFiles.map((file) => (
                <CodeLocationLink
                  key={formatLocation(file)}
                  path={file.path}
                  onOpen={fileOpener(file.path)}
                  className={styles.mono}
                >
                  {formatLocation(file)}
                </CodeLocationLink>
              ))}
              {files.length > MAX_FILES && <span>외 {files.length - MAX_FILES}개</span>}
            </dd>
          )}
        </div>
      </dl>
    </li>
  )
}
