import type { ResponseGuide as Guide, GuideStep, StatusClass } from '../../../lib/responseGuide'
import styles from './ResponseGuide.module.css'

interface ResponseGuideProps {
  guide: Guide
}

const STATUS_ROWS: { statusClass: StatusClass; code: string; text: string }[] = [
  { statusClass: 'auth', code: '401 · 403', text: '우리 쪽 API 키·권한부터 확인 (키 만료, 잘못된 환경변수)' },
  { statusClass: 'rate', code: '429', text: '호출량과 요청 한도 확인' },
  { statusClass: 'server', code: '5xx', text: '공급자 상태와 응답 로그부터 확인' },
]

function Steps({ title, steps }: { title: string; steps: GuideStep[] }) {
  return (
    <section className={styles.section}>
      <h4 className={styles.sectionTitle}>{title}</h4>
      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li key={step.text} className={styles.step}>
            <span className={styles.number}>{index + 1}</span>
            <div className={styles.stepBody}>
              <p>
                {step.link ? (
                  <>
                    같은 시간대{' '}
                    <a href={step.link.href} target="_blank" rel="noreferrer" className={styles.link}>
                      {step.link.label}
                    </a>{' '}
                    공지
                  </>
                ) : (
                  step.text
                )}
              </p>
              {step.codeFact && <p className={styles.fact}>{step.codeFact}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/**
 * 대응 가이드: 응답 코드 기준으로 먼저 볼 곳과 원인을 몰라도 안전한 조치만 안내한다.
 * 원인을 확정하는 문구는 쓰지 않는다.
 */
export function ResponseGuide({ guide }: ResponseGuideProps) {
  return (
    <section className={styles.guide} aria-label="대응 가이드">
      <header className={styles.header}>
        <h3 className={styles.title}>대응 가이드</h3>
        <span className={styles.basisLabel}>{guide.basisLabel}</span>
      </header>
      <p className={styles.basis}>{guide.basis}</p>
      <Steps title="먼저 확인" steps={guide.checkFirst} />
      <Steps title="바로 할 수 있는 대응" steps={guide.actNow} />
      <div className={styles.byStatus}>
        <p className={styles.byStatusTitle} id="guide-by-status">
          응답 코드가 다르다면
        </p>
        <table className={styles.table} aria-labelledby="guide-by-status">
          <tbody>
          {STATUS_ROWS.map((row) => {
            const current = row.statusClass === guide.statusClass
            return (
              <tr key={row.code} data-current={current || undefined}>
                <th scope="row">{row.code}</th>
                <td>{row.text}</td>
                <td className={styles.current}>{current ? '현재' : ''}</td>
              </tr>
            )
          })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
