import { useMemo, useState } from 'react'
import type { FileEntry, ProviderSummary } from '../../../api/contract'
import { ancestorPaths, buildFileTree } from '../../../lib/fileTree'
import { FileTreeRows } from './FileTreeRows'
import styles from './RelatedFiles.module.css'

/** 모바일 상세: 선택한 공급자의 근거 파일만 모은 작은 트리 (모두 펼침) */
export function RelatedFiles({ provider }: { provider: ProviderSummary }) {
  const { tree, highlights, allDirs } = useMemo(() => {
    const entries: FileEntry[] = provider.files.map((file) => ({ path: file.path, state: 'analyzed', matches: [] }))
    return {
      tree: buildFileTree(entries),
      highlights: new Map(provider.files.map((file) => [file.path, file.line] as const)),
      allDirs: new Set(provider.files.flatMap((file) => ancestorPaths(file.path))),
    }
  }, [provider])
  const [expanded, setExpanded] = useState<Set<string>>(allDirs)

  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })

  if (provider.files.length === 0) return null

  return (
    <section className={styles.related} aria-label="관련 파일">
      <ul>
        <FileTreeRows nodes={tree} depth={0} expanded={expanded} onToggle={toggle} highlights={highlights} />
      </ul>
    </section>
  )
}
