// 숫자 끝자리를 한국어로 읽었을 때 받침이 있는지 (영·일·삼·육·칠·팔 → 있음 / 이·사·오·구 → 없음)
const DIGIT_BATCHIM = [true, true, false, true, false, false, true, true, true, false]

/** 마지막 글자에 받침이 있는지. 숫자는 읽는 소리로 판단한다. */
function hasBatchim(word: string): boolean {
  const last = word[word.length - 1] ?? ''
  if (/[0-9]/.test(last)) return DIGIT_BATCHIM[Number(last)]
  const code = last.charCodeAt(0) - 0xac00
  return code >= 0 && code <= 11171 && code % 28 !== 0
}

/** 받침에 맞는 조사를 붙인다. 예: josa('재시도', '이', '가') → 재시도가, josa(503, '은', '는') → 503은 */
export function josa(word: string | number, withBatchim: string, withoutBatchim: string): string {
  const text = String(word)
  return `${text}${hasBatchim(text) ? withBatchim : withoutBatchim}`
}
