const kstTimeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** ISO 8601 UTC 시각을 KST HH:mm 으로 */
export function formatKstTime(iso: string): string {
  return kstTimeFormat.format(new Date(iso))
}
