import type { CodeFacts, DemoEvent, EvidenceItem, ProviderDetail, ProviderSummary } from '../api/contract'
import { josa } from './korean'
import { primaryLocation, type SameCategory } from './sameCategory'
import { formatKstTime } from './time'

/** 응답 코드 구간. 원인은 확정하지 않고, 코드 구간별로 먼저 볼 곳만 안내한다. */
export type StatusClass = 'auth' | 'rate' | 'server' | 'other'

export function classifyStatus(httpStatus: number): StatusClass {
  if (httpStatus === 401 || httpStatus === 403) return 'auth'
  if (httpStatus === 429) return 'rate'
  if (httpStatus >= 500 && httpStatus <= 599) return 'server'
  return 'other'
}

export interface GuideStep {
  text: string
  /** 코드에서 확인한 사실 (예: checkout.ts에 재시도·타임아웃이 없어요) */
  codeFact?: string
  /** 공급자 상태 페이지 링크 */
  link?: { label: string; href: string }
}

export interface ResponseGuide {
  basisLabel: string
  basis: string
  checkFirst: GuideStep[]
  actNow: GuideStep[]
  statusClass: StatusClass
}

const FACT_LABELS: Record<keyof CodeFacts, string> = {
  errorHandling: '오류 처리',
  retry: '재시도',
  timeout: '타임아웃',
  statusCheck: '응답 상태 확인',
}

function fileName(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}

/** 첫 호출부 근거의 facts에서 "없는 처리"만 모아 문장으로. 다 있으면 없음. */
function missingFactsSentence(evidence: EvidenceItem | undefined): string | undefined {
  if (!evidence?.facts) return undefined
  const missing = (Object.keys(FACT_LABELS) as (keyof CodeFacts)[]).filter((key) => !evidence.facts?.[key])
  if (missing.length === 0) return undefined
  const list = missing.map((key) => FACT_LABELS[key]).join('·')
  return `코드 확인 · ${fileName(evidence.path)}에 ${josa(list, '이', '가')} 없어요`
}

const BASIS: Record<StatusClass, (code: number) => string> = {
  server: (code) => `${josa(code, '은', '는')} 공급자 측 일시 장애일 가능성이 높아요. 다만 중간 서버를 거친 오류라면 원래 원인이 다를 수 있어요.`,
  rate: () => '429는 요청 한도를 넘었다는 뜻이에요. 공급자 장애가 아니라 우리 쪽 호출량 문제일 수 있어요.',
  auth: (code) => `${josa(code, '은', '는')} 인증·권한 오류예요. 공급자 장애보다 우리 쪽 API 키나 권한 설정 문제일 수 있어요.`,
  other: (code) => `${code} 응답만으로는 원인을 좁히기 어려워요. 응답 본문과 같은 시간대 로그를 함께 확인해 주세요.`,
}

/**
 * 같은 분류 서비스로 요청을 넘길 수 있는지 검토하는 항목. 대체할 수 있다고 단정하지 않는다.
 * 예: 이미 연동된 Toss Payments 쪽으로 결제 요청을 넘길 수 있는지 검토하기
 */
function sameCategoryStep(same: SameCategory): GuideStep {
  const names = same.services.map((service) => service.name).join(' · ')
  const first = same.services[0]
  const location = primaryLocation(first)
  return {
    text: `이미 연동된 ${names} 쪽으로 ${same.label} 요청을 넘길 수 있는지 검토하기`,
    codeFact: location ? `코드 확인 · ${location}에서 ${first.name} 호출을 찾았어요` : undefined,
  }
}

/**
 * 데모 재현 이벤트 + 선택한 공급자의 근거로 대응 가이드를 만든다.
 * 문구는 figdora "데모 재현 + Stripe 선택" 시안의 대응 가이드를 따른다.
 * same: 같은 분류로 호출되고 있는 다른 서비스. 공급자 쪽 장애(5xx)일 때만 검토 항목으로 넣는다.
 */
export function buildResponseGuide(
  event: DemoEvent,
  provider: ProviderSummary,
  detail: ProviderDetail,
  same: SameCategory | null = null,
): ResponseGuide {
  const statusClass = classifyStatus(event.httpStatus)
  const code = event.httpStatus
  const primary = detail.evidence[0]
  const callSite = detail.evidence.find((item) => item.facts) ?? primary
  const file = primary ? fileName(primary.path) : undefined
  const time = formatKstTime(event.occurredAt)
  const fact = missingFactsSentence(callSite)

  const checkFirst: GuideStep[] = [
    {
      text: file
        ? `${time} KST 전후 ${file} ${provider.role} 요청의 응답 로그에 ${josa(code, '이', '가')} 몰려 있는지`
        : `${time} KST 전후 ${provider.role} 요청의 응답 로그에 ${josa(code, '이', '가')} 몰려 있는지`,
    },
  ]
  const statusPageUrl = detail.provider.statusPageUrl
  if (statusPageUrl) {
    checkFirst.push({ text: '같은 시간대 공지', link: { label: `${provider.name} 상태 페이지 ↗`, href: statusPageUrl } })
  }

  const actNow: GuideStep[] =
    statusClass === 'server'
      ? [
          { text: `${provider.role} 실패 시 사용자에게 ‘잠시 후 다시 시도해 주세요’ 안내 띄우기` },
          ...(same ? [sameCategoryStep(same)] : []),
          { text: '재시도에 백오프와 타임아웃 적용하기', codeFact: fact },
          { text: `실패한 ${provider.role} 요청을 모아 두었다가 공급자 복구 후 재처리하기` },
        ]
      : statusClass === 'rate'
        ? [
            { text: '같은 요청을 반복해서 보내는 곳이 없는지 호출 횟수 확인하기' },
            { text: '재시도 간격을 늘리고 백오프 적용하기', codeFact: fact },
          ]
        : statusClass === 'auth'
          ? [
              { text: 'API 키가 만료되거나 잘못된 환경변수로 배포되지 않았는지 확인하기' },
              { text: '키를 바꿨다면 새 키가 배포에 반영됐는지 확인하기' },
            ]
          : [{ text: '응답 본문의 오류 메시지 확인하기', codeFact: fact }]

  return {
    basisLabel: `HTTP ${code} 기준 · 원인 확정 아님`,
    basis: BASIS[statusClass](code),
    checkFirst,
    actNow,
    statusClass,
  }
}
