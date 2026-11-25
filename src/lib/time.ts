const kstTimeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const kstDateParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** ISO 8601 UTC 시각을 KST HH:mm 으로 */
export function formatKstTime(iso: string): string {
  return kstTimeFormat.format(new Date(iso))
}

/** ISO 8601 UTC 시각을 "2026-11-25 10:00 KST" 로 */
export function formatKstDateTime(iso: string): string {
  const date = new Date(iso)
  return `${kstDateParts.format(date)} ${kstTimeFormat.format(date)} KST`
}
