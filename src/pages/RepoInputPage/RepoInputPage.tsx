import { AppHeader } from '../../components/layout/AppHeader'
import styles from './RepoInputPage.module.css'

/** SCR-001 저장소 입력. 입력 폼·예제 진입·오류 상태는 다음 작업에서 채운다. */
export function RepoInputPage() {
  return (
    <div className={styles.page}>
      <AppHeader trailing={<span className={styles.meta}>공개 저장소 · 읽기 전용</span>} />
      <main className={styles.body}>
        <div className={styles.content}>
          <div className={styles.heading}>
            <h1 className={styles.title}>외부 서비스 장애 지도</h1>
            <p className={styles.description}>
              공개 GitHub 저장소가 쓰는 외부 서비스를 찾아, 공급자의 공개 상태와 코드의 호출 위치를 한 화면에 보여줍니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
