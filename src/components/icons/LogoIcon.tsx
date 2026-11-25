interface LogoIconProps {
  size?: number
  className?: string
}

/** Tracer 로고: 한 점에서 갈라지는 호출 경로 */
export function LogoIcon({ size = 18, className }: LogoIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <circle cx="4" cy="6" r="2" />
      <circle cx="20" cy="6" r="2" />
      <circle cx="12" cy="21" r="2" />
      <path d="M6 7l4 3.5M18 7l-4 3.5M12 15v4" />
    </svg>
  )
}
