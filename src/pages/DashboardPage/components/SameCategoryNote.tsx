import { Icon } from '../../../components/icons/Icon'
import { primaryLocation, type SameCategory } from '../../../lib/sameCategory'
import styles from './SameCategoryNote.module.css'

interface SameCategoryNoteProps {
  same: SameCategory
  onSelect: (providerId: string) => void
}

/**
 * 근거 아래: 같은 분류로 호출되고 있는 다른 서비스.
 * 대체할 수 있는지는 코드로 알 수 없어서 "호출되고 있다"는 사실만 쓴다.
 */
export function SameCategoryNote({ same, onSelect }: SameCategoryNoteProps) {
  return (
    <section className={styles.note} aria-label={`같은 ${same.label} 분류 서비스`}>
      <p className={styles.title}>같은 {same.label} 분류의 다른 서비스도 호출되고 있어요</p>
      <ul className={styles.list}>
        {same.services.map((service) => {
          const location = primaryLocation(service)
          return (
            <li key={service.id}>
              <button type="button" className={styles.item} onClick={() => onSelect(service.id)}>
                <span className={styles.name}>{service.name}</span>
                {location && <span className={styles.location}>{location}</span>}
                <Icon name="chevronRight" size={14} className={styles.chevron} />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
