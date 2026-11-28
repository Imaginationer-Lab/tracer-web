import type { ProviderAlternatives, ProviderSummary } from '../../../api/contract'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { DashedBadge } from '../../../components/ui/DashedBadge'
import { Spinner } from '../../../components/ui/Spinner'
import type { AlternativesLoad } from '../../../hooks/useProviderAlternatives'
import { useProviderStatuses } from '../../../hooks/useProviderStatuses'
import { alternativesErrorBody, formatShortLocation } from '../../../lib/alternatives'
import { AlternativeCard } from './AlternativeCard'
import { CodeLocationLink } from './CodeLocationLink'
import styles from './AlternativesSection.module.css'

interface AlternativesSectionProps {
  provider: ProviderSummary
  load: AlternativesLoad
  /** "대체 서비스 찾기" · "다시 시도" */
  onStart: () => void
  /** 이 서비스의 근거 파일을 누르면 그 근거를 펼친다. 없으면(모바일) 위치를 글자로만 보여 준다 */
  onOpenFile?: (path: string) => void
}

/**
 * 근거 패널: 이 저장소가 그 서비스에서 쓰는 기능 기준 대체 서비스 (AI 제안).
 * 서버가 검증하지 않은 AI 답이라 항상 "AI 제안" 배지를 붙인다.
 */
export function AlternativesSection({ provider, load, onStart, onOpenFile }: AlternativesSectionProps) {
  const label = `${provider.name} 대체 서비스`

  if (load.phase === 'loaded') {
    return (
      <section className={styles.section} aria-label={label}>
        <Loaded provider={provider} data={load.data} onOpenFile={onOpenFile} />
      </section>
    )
  }

  return (
    <section className={styles.section} aria-label={label}>
      <h3 className={styles.header}>
        <span className={styles.title}>대체 서비스</span>
        <DashedBadge>AI 제안</DashedBadge>
      </h3>

      {load.phase === 'idle' && (
        <>
          <p className={styles.body}>
            이 저장소가 {provider.name}에서 쓰는 기능을 보고, 대신 검토할 수 있는 서비스를 AI가 찾아 드려요.
          </p>
          <Button variant="ghost" size="sm" onClick={onStart} className={styles.start}>
            대체 서비스 찾기
          </Button>
        </>
      )}

      {load.phase === 'loading' && (
        <div className={styles.loading} role="status">
          <p className={styles.loadingText}>
            <Spinner size={14} />
            {provider.name}에서 쓰는 기능을 보고 대체 서비스를 찾고 있어요
          </p>
          <p className={styles.caption}>처음 한 번은 몇 초 걸려요</p>
          <span className={styles.skeleton} style={{ width: '50%' }} />
          <span className={styles.skeleton} style={{ width: '85%' }} />
          <span className={styles.skeleton} style={{ width: '70%' }} />
        </div>
      )}

      {load.phase === 'error' && (
        <Alert
          tone="error"
          title="대체 서비스를 찾지 못했어요"
          action={
            load.error.retryable && (
              <Button variant="ghost" size="sm" onClick={onStart}>
                다시 시도
              </Button>
            )
          }
        >
          {alternativesErrorBody(load.error)}
        </Alert>
      )}
    </section>
  )
}

function Loaded({
  provider,
  data,
  onOpenFile,
}: {
  provider: ProviderSummary
  data: ProviderAlternatives
  onOpenFile?: (path: string) => void
}) {
  const { statuses } = useProviderStatuses(data.alternatives)
  const ownPaths = new Set(provider.files.map((file) => file.path))
  // 지금 서비스의 근거 파일만 누를 수 있다 (다른 파일은 근거 패널에 없음)
  const fileOpener = (path: string) => (onOpenFile && ownPaths.has(path) ? onOpenFile : undefined)

  return (
    <>
      <h3 className={styles.header}>
        <span className={styles.title}>{provider.name} 대신 검토할 수 있는 서비스</span>
        <DashedBadge>AI 제안</DashedBadge>
      </h3>

      {data.features.length > 0 && (
        <div className={styles.features}>
          <span className={styles.featuresLabel}>쓰는 기능</span>
          <ul className={styles.chips}>
            {data.features.map((feature) => {
              const first = feature.files[0]
              return (
                <li key={feature.key} className={styles.chip}>
                  {feature.label}
                  {first && (
                    <CodeLocationLink path={first.path} onOpen={fileOpener(first.path)} className={styles.chipLocation}>
                      {formatShortLocation(first)}
                      {feature.files.length > 1 && ` 외 ${feature.files.length - 1}`}
                    </CodeLocationLink>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {data.alternatives.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>대체할 서비스가 없어요</p>
          <p className={styles.caption}>쓰는 기능을 기준으로 같은 분류의 서비스를 찾아봤지만 마땅한 곳이 없었어요.</p>
        </div>
      ) : (
        <ul className={styles.cards}>
          {data.alternatives.map((alternative) => (
            <AlternativeCard
              key={alternative.id}
              alternative={alternative}
              features={data.features}
              statusLoad={statuses[alternative.id]}
              fileOpener={fileOpener}
            />
          ))}
        </ul>
      )}
    </>
  )
}
