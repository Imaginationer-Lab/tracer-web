import { useParams } from 'react-router'
import { AppHeader } from '../../components/layout/AppHeader'
import styles from './DashboardPage.module.css'

/** SCR-002 분석 대시보드. 공급자 목록·파일 트리·근거 패널·데모 재현은 다음 작업에서 채운다. */
export function DashboardPage() {
  const { analysisId } = useParams<{ analysisId: string }>()

  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.body}>
        <p className={styles.placeholder}>
          분석 <code>{analysisId}</code> 대시보드 자리예요.
        </p>
      </main>
    </div>
  )
}
