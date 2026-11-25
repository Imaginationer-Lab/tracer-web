import { request } from './client'
import type { DemoEvent } from './contract'

/** 데모 재현 이벤트. 실제 공개 상태를 덮어쓰지 않고 프론트 상태로만 표시한다. */
export function getCurrentDemoEvent(signal?: AbortSignal): Promise<DemoEvent> {
  return request<DemoEvent>('/demo-events/current', { signal })
}
