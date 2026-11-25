import styles from './DashedBadge.module.css'

/**
 * 점선 테두리 배지. 실제 공개 상태(꽉 찬 배지)와 구분해서
 * "확정이 아닌 것"(데모 재현, AI 판단)을 표시할 때 쓴다.
 */
export function DashedBadge({ children }: { children: string }) {
  return <span className={styles.badge}>{children}</span>
}
