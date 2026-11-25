import { Button } from '../../../components/ui/Button'
import styles from './ExampleRepoCard.module.css'

interface ExampleRepoCardProps {
  /** 입력란만 채운다. 분석은 사용자가 시작한다. */
  onUse: () => void
}

export function ExampleRepoCard({ onUse }: ExampleRepoCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.text}>
        <h2 className={styles.title}>처음이라면 예제 저장소로 시작해 보세요</h2>
        <p className={styles.description}>
          가상 쇼핑몰 · <strong>Supabase</strong> 로그인, <strong>Stripe</strong> 결제, <strong>Amazon S3</strong> 업로드
        </p>
      </div>
      <Button variant="ghost" size="sm" className={styles.button} onClick={onUse}>
        예제 저장소 사용
      </Button>
    </section>
  )
}
