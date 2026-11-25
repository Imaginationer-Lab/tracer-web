import { useMemo, useState } from 'react'
import type { AnalysisResult } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { Card } from '../../../components/ui/Card'
import { ancestorPaths, buildFileTree, type FileTreeNode } from '../../../lib/fileTree'
import styles from './FileTreeCard.module.css'
import { FileTreeRows } from './FileTreeRows'

interface FileTreeCardProps {
  result: AnalysisResult
  className?: string
}

/**
 * 처음 펼쳐 둘 폴더: 맨 위 폴더가 하나뿐이면(예: src) 그 폴더, 그리고 읽기 실패 파일이 있는 폴더.
 * 맨 위 폴더가 여러 개면 모두 접어 둔다 (큰 저장소에서 트리가 끝없이 길어지지 않게).
 */
function initialExpanded(result: AnalysisResult, tree: FileTreeNode[]): Set<string> {
  const open = new Set<string>()
  const topDirs = tree.filter((node) => node.kind === 'dir')
  if (topDirs.length === 1) open.add(topDirs[0].path)
  for (const file of result.files) {
    if (file.state === 'skipped') for (const path of ancestorPaths(file.path)) open.add(path)
  }
  return open
}

/**
 * 파일 트리. 데스크톱에서는 항상 펼쳐 두고, 모바일에서는 머리글을 눌러 접고 편다.
 * (모바일에서는 읽기 실패가 있을 때만 처음부터 펼친다)
 */
export function FileTreeCard({ result, className }: FileTreeCardProps) {
  const tree = useMemo(() => buildFileTree(result.files), [result.files])
  const [expanded, setExpanded] = useState(() => initialExpanded(result, tree))
  const hasSkipped = result.summary.skipped > 0
  const [mobileOpen, setMobileOpen] = useState(hasSkipped)

  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })

  return (
    <Card className={[styles.card, className].filter(Boolean).join(' ')} data-mobile-open={mobileOpen}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setMobileOpen((open) => !open)}
        aria-expanded={mobileOpen}
      >
        <span className={styles.title}>
          <Icon name="folder" size={16} className={styles.titleIcon} />
          파일
        </span>
        <span className={styles.caption} data-warning={hasSkipped || undefined}>
          {hasSkipped ? `읽기 실패 ${result.summary.skipped}개` : `분석한 파일 ${result.summary.analyzed}개`}
        </span>
        <Icon name="chevronDown" size={16} className={styles.toggleIcon} />
      </button>
      <ul className={styles.tree}>
        <FileTreeRows nodes={tree} depth={0} expanded={expanded} onToggle={toggle} />
      </ul>
    </Card>
  )
}
