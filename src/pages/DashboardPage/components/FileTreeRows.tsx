import type { SkipReason } from '../../../api/contract'
import { Icon } from '../../../components/icons/Icon'
import type { FileTreeNode } from '../../../lib/fileTree'
import styles from './FileTreeRows.module.css'

const SKIP_REASON_LABELS: Record<SkipReason, string> = {
  'too-large': '용량이 커서 건너뛰었어요',
  minified: '압축된 코드라 건너뛰었어요',
  'parse-error': '코드를 해석하지 못해 건너뛰었어요',
}

interface FileTreeRowsProps {
  nodes: FileTreeNode[]
  depth: number
  expanded: ReadonlySet<string>
  onToggle: (path: string) => void
  /** 강조할 파일 경로 → 근거 줄 번호 (선택한 공급자의 근거 파일) */
  highlights?: ReadonlyMap<string, number>
  /** 보조 표시할 파일 경로 → 문구 (예: 같은 분류 · 2행). 강조보다 약하게 그린다 */
  marks?: ReadonlyMap<string, string>
  /** 칩이 달린 파일(강조·보조 표시)을 눌렀을 때. 칩이 없는 파일은 보여줄 내용이 없어 누를 수 없다 */
  onFileClick?: (path: string) => void
}

/** 폴더는 펼치고 접을 수 있고, 펼친 폴더의 자식만 그린다 */
export function FileTreeRows({ nodes, depth, expanded, onToggle, highlights, marks, onFileClick }: FileTreeRowsProps) {
  const indent = { paddingLeft: 12 + depth * 16 }

  return (
    <>
      {nodes.map((node) => {
        if (node.kind === 'dir') {
          const open = expanded.has(node.path)
          return (
            <li key={node.path}>
              <button type="button" className={styles.row} style={indent} onClick={() => onToggle(node.path)} aria-expanded={open}>
                <Icon name={open ? 'chevronDown' : 'chevronRight'} size={12} className={styles.chevron} />
                <Icon name="folder" size={14} className={styles.icon} />
                <span className={styles.name}>{node.name}</span>
              </button>
              {open && (
                <ul>
                  <FileTreeRows
                    nodes={node.children}
                    depth={depth + 1}
                    expanded={expanded}
                    onToggle={onToggle}
                    highlights={highlights}
                    marks={marks}
                    onFileClick={onFileClick}
                  />
                </ul>
              )}
            </li>
          )
        }

        const { entry } = node
        const skipped = entry.state === 'skipped'
        const highlightLine = highlights?.get(node.path)
        const highlighted = highlightLine !== undefined
        const mark = highlighted ? undefined : marks?.get(node.path)
        // 읽기 실패 파일은 근거가 없어 칩이 붙지 않는다. 혹시 붙어도 안쪽 툴팁과 겹치지 않게 버튼으로 만들지 않는다
        const clickable = (highlighted || mark !== undefined) && !skipped && onFileClick !== undefined
        const content = (
          <>
            <span className={styles.spacer} aria-hidden="true" />
            <Icon name="file" size={14} className={styles.icon} />
            <span className={styles.name}>{node.name}</span>
            {highlighted && <span className={styles.related}>관련 파일 · {highlightLine}행</span>}
            {mark && <span className={styles.mark}>{mark}</span>}
          </>
        )
        return (
          <li key={node.path}>
            {clickable ? (
              <button
                type="button"
                className={styles.row}
                style={indent}
                data-highlighted={highlighted || undefined}
                data-marked={mark !== undefined || undefined}
                onClick={() => onFileClick?.(node.path)}
              >
                {content}
              </button>
            ) : (
              <div
                className={styles.row}
                style={indent}
                data-skipped={skipped || undefined}
                data-highlighted={highlighted || undefined}
                data-marked={mark !== undefined || undefined}
              >
                {content}
                {skipped && (
                  <span className={styles.skip} tabIndex={0} aria-describedby={`skip-${node.path}`}>
                    읽기 실패
                    <span id={`skip-${node.path}`} role="tooltip" className={styles.tooltip}>
                      {SKIP_REASON_LABELS[entry.reason]}
                    </span>
                  </span>
                )}
              </div>
            )}
          </li>
        )
      })}
    </>
  )
}
