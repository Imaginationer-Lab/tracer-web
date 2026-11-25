// 화면 경로. 경로 문자열은 여기서만 만든다.
export const paths = {
  /** SCR-001 저장소 입력 */
  home: '/',
  /** SCR-002 분석 대시보드 */
  analysisPattern: '/analyses/:analysisId',
  analysis: (analysisId: string) => `/analyses/${encodeURIComponent(analysisId)}`,
} as const
