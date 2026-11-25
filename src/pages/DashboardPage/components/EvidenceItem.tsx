import { useId, useState } from 'react'
import type { EvidenceItem as Evidence } from '../../../api/contract'
import { CodeSnippet } from '../../../components/code/CodeSnippet'
import { Icon } from '../../../components/icons/Icon'
import styles from './EvidenceItem.module.css'

interface EvidenceItemProps {
  evidence: Evidence
  /** 강한 근거 순 첫 항목: 처음부터 펼치고 "여기부터 확인하세요"를 붙인다 */
  primary: boolean
}

function splitPath(path: string): { dir: string; file: string } {
  const slash = path.lastIndexOf('/')
  return slash === -1 ? { dir: '', file: path } : { dir: path.slice(0, slash + 1), file: path.slice(slash + 1) }
}

export function EvidenceItem({ evidence, primary }: EvidenceItemProps) {
  const [open, setOpen] = useState(primary)
  const bodyId = useId()
  const { dir, file } = splitPath(evidence.path)
  const endpoint = evidence.endpoint ? `${evidence.endpoint.host}${evidence.endpoint.path ?? ''}` : null

  return (
    <li className={styles.item} data-open={open || undefined}>
      <button type="button" className={styles.head} onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={bodyId}>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={12} className={styles.chevron} />
        <span className={styles.path}>
          {dir}
          <strong>{file}</strong>
          <span className={styles.line}>:{evidence.line}</span>
        </span>
        {primary && <span className={styles.first}>여기부터 확인하세요</span>}
        <span className={styles.reason}>{evidence.reason.label}</span>
      </button>
      {open && (
        <div id={bodyId} className={styles.body}>
          {endpoint && (
            <p className={styles.endpoint}>
              엔드포인트 <code>{endpoint}</code>
            </p>
          )}
          <CodeSnippet startLine={evidence.snippet.startLine} lines={evidence.snippet.lines} highlightLine={evidence.line} />
        </div>
      )}
    </li>
  )
}
