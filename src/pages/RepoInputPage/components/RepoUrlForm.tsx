import { useId, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import styles from './RepoUrlForm.module.css'

interface RepoUrlFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  /** 분석 중: 입력과 버튼을 막는다 (중복 제출 방지) */
  loading: boolean
  /** 형식 오류: 입력란을 빨간 선으로 표시하고 안내를 바꾼다 */
  invalid: boolean
}

export function RepoUrlForm({ value, onChange, onSubmit, loading, invalid }: RepoUrlFormProps) {
  const inputId = useId()
  const messageId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!loading) onSubmit()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.label} htmlFor={inputId}>
        공개 GitHub 저장소 URL
      </label>
      <input
        id={inputId}
        className={styles.input}
        type="url"
        inputMode="url"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="https://github.com/owner/repo"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={loading}
        aria-invalid={invalid || undefined}
        aria-describedby={messageId}
      />
      <Button type="submit" className={styles.submit} loading={loading}>
        {loading ? '분석 중' : '분석'}
      </Button>
      {invalid ? (
        <p id={messageId} className={`${styles.message} ${styles.error}`} role="alert">
          공개 GitHub 저장소 URL을 입력해 주세요. <span className={styles.example}>예: https://github.com/owner/repo</span>
        </p>
      ) : (
        <p id={messageId} className={styles.message}>
          공개 저장소만 분석해요. 코드는 실행하지 않고 읽기만 합니다.
        </p>
      )}
    </form>
  )
}
