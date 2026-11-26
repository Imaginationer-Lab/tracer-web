import { useEffect, useMemo, useRef, useState } from 'react'
import type { AnalysisResult } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import { Card } from '../../../components/ui/Card'
import { ancestorPaths, buildFileTree, type FileTreeNode } from '../../../lib/fileTree'
import styles from './FileTreeCard.module.css'
import { FileTreeRows } from './FileTreeRows'

export interface FileHighlight {
  /** 선택이 바뀌었는지 알아보는 값 (예: provider:stripe) */
  key: string
  /** 머리글 문구에 쓰는 이름 (예: Stripe) */
  label: string
  files: { path: string; line: number }[]
  /** 함께 보조 표시할 파일 (예: 대응 가이드의 같은 분류 서비스). 상위 폴더도 펼친다 */
  marks?: { path: string; label: string }[]
}

interface FileTreeCardProps {
  result: AnalysisResult
  /** 선택한 공급자·서비스의 근거 파일. 강조하고 상위 폴더를 펼친다 */
  highlight?: FileHighlight
  /** 칩이 달린 파일(강조·보조 표시)을 눌렀을 때 */
  onFileClick?: (path: string) => void
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

function withAncestorsOf(expanded: Set<string>, paths: Iterable<string>): Set<string> {
  const next = new Set(expanded)
  for (const path of paths) for (const dir of ancestorPaths(path)) next.add(dir)
  return next
}

/**
 * 파일 트리. 데스크톱에서는 항상 펼쳐 두고, 모바일에서는 머리글을 눌러 접고 편다.
 * (모바일에서는 읽기 실패가 있을 때만 처음부터 펼친다)
 */
export function FileTreeCard({ result, highlight, onFileClick, className }: FileTreeCardProps) {
  const tree = useMemo(() => buildFileTree(result.files), [result.files])
  const highlights = useMemo(
    () => new Map(highlight ? highlight.files.map((file) => [file.path, file.line] as const) : []),
    [highlight],
  )
  const marks = useMemo(
    () => new Map((highlight?.marks ?? []).map((mark) => [mark.path, mark.label] as const)),
    [highlight],
  )
  const shownPaths = () => [...highlights.keys(), ...marks.keys()]
  const [expanded, setExpanded] = useState(() => withAncestorsOf(initialExpanded(result, tree), shownPaths()))
  const [highlightedFor, setHighlightedFor] = useState(highlight?.key)
  const hasSkipped = result.summary.skipped > 0
  const [mobileOpen, setMobileOpen] = useState(hasSkipped)
  const treeRef = useRef<HTMLUListElement>(null)

  // 공급자를 바꾸면 새 근거 파일의 상위 폴더를 펼친다 (렌더 중 조정: 이전 선택과 다를 때만)
  if (highlightedFor !== highlight?.key) {
    setHighlightedFor(highlight?.key)
    setExpanded((prev) => withAncestorsOf(prev, shownPaths()))
  }

  // 첫 번째 강조 파일이 보이도록 스크롤 (DOM 조작만, 상태는 바꾸지 않음)
  useEffect(() => {
    if (!highlight) return
    treeRef.current?.querySelector('[data-highlighted]')?.scrollIntoView({ block: 'nearest' })
  }, [highlight])

  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })

  const caption = highlight
    ? `${highlight.label} 관련 ${highlight.files.length}개 강조`
    : hasSkipped
      ? `읽기 실패 ${result.summary.skipped}개`
      : `분석한 파일 ${result.summary.analyzed}개`

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
        <span className={styles.caption} data-warning={(!highlight && hasSkipped) || undefined}>
          {caption}
        </span>
        <Icon name="chevronDown" size={16} className={styles.toggleIcon} />
      </button>
      <ul className={styles.tree} ref={treeRef}>
        <FileTreeRows
          nodes={tree}
          depth={0}
          expanded={expanded}
          onToggle={toggle}
          highlights={highlights}
          marks={marks}
          onFileClick={onFileClick}
        />
      </ul>
    </Card>
  )
}
