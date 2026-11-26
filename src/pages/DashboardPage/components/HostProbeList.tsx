import type { ServiceHost } from '../../../api/contract'
import { describeHostProbe, latestCheckedAt, replayHostIndex } from '../../../lib/hostProbe'
import { formatKstTime } from '../../../lib/time'
import styles from './HostProbeList.module.css'

interface HostProbeListProps {
  hosts: ServiceHost[]
  /** 데모 재현 이벤트의 공급자면 그 HTTP 코드. 실제 확인 결과는 그대로 두고 칩만 덧붙인다 */
  replayStatus?: number
}

/**
 * 근거 위: Tracer 서버가 호스트 루트에 직접 요청해 본 결과.
 * 목록의 공식 상태(공급자가 발표한 값)와 출처가 달라서, 머리글에 출처를 쓰고 배지 모양을 쓰지 않는다.
 */
export function HostProbeList({ hosts, replayStatus }: HostProbeListProps) {
  if (hosts.length === 0) return null
  const replayIndex = replayStatus === undefined ? -1 : replayHostIndex(hosts)
  const checkedAt = latestCheckedAt(hosts)

  return (
    <section className={styles.section} aria-label="서버 응답">
      <div className={styles.header}>
        <span className={styles.title}>서버 응답</span>
        <span className={styles.caption}>Tracer가 직접 요청{checkedAt && ` · ${formatKstTime(checkedAt)}`}</span>
      </div>
      <ul className={styles.list}>
        {hosts.map((host, index) => {
          const view = describeHostProbe(host)
          const replay = index === replayIndex
          return (
            <li key={host.host} className={styles.item}>
              <div className={styles.top}>
                <span className={styles.name}>{host.name}</span>
                <span className={styles.host}>{host.host}</span>
                <span className={styles.result} data-tone={view.tone}>
                  <span className={view.marker === 'hollow' ? styles.hollow : styles.dot} aria-hidden="true" />
                  {view.label}
                  {view.detail && <span className={styles.detail}> · {view.detail}</span>}
                </span>
              </div>
              {(host.files.length > 0 || replay) && (
                <div className={styles.meta}>
                  <span className={styles.files}>
                    {host.files.map((file) => (
                      <span key={`${file.path}:${file.line}`}>
                        {file.path}:{file.line}
                      </span>
                    ))}
                  </span>
                  {replay && <span className={styles.replay}>데모 재현 HTTP {replayStatus}</span>}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
