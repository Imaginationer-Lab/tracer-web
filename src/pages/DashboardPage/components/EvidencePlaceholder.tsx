import { Icon } from '../../../components/icons/Icon'
import { Card } from '../../../components/ui/Card'
import styles from './EvidencePlaceholder.module.css'

/** 공급자를 고르기 전 근거 패널 자리 (데스크톱) */
export function EvidencePlaceholder({ className }: { className?: string }) {
  return (
    <Card dashed className={[styles.empty, className].filter(Boolean).join(' ')}>
      <Icon name="pointer" size={20} className={styles.icon} />
      <p className={styles.title}>공급자를 선택하면 관련 파일을 볼 수 있어요</p>
      <p className={styles.body}>왼쪽 목록에서 서비스를 고르면 근거 파일과 줄 번호가 여기에 표시돼요.</p>
    </Card>
  )
}
