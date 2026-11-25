import styles from './CodeSnippet.module.css'

interface CodeSnippetProps {
  startLine: number
  lines: string[]
  /** 강조할 줄 번호 (근거 줄) */
  highlightLine?: number
}

/** 줄 번호 + 코드. 줄바꿈하지 않고 가로로 스크롤한다. 탭·공백은 원문 그대로. */
export function CodeSnippet({ startLine, lines, highlightLine }: CodeSnippetProps) {
  return (
    <pre className={styles.snippet}>
      <code className={styles.code}>
        {lines.map((line, index) => {
          const lineNumber = startLine + index
          return (
            <span key={lineNumber} className={styles.line} data-highlighted={lineNumber === highlightLine || undefined}>
              <span className={styles.number} aria-hidden="true">
                {lineNumber}
              </span>
              <span className={styles.text}>{line || ' '}</span>
            </span>
          )
        })}
      </code>
    </pre>
  )
}
