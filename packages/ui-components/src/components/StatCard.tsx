import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  trend?: { value: string; positive: boolean }
  onClick?: () => void
  className?: string
}

function TrendArrowUp() {
  return (
    <svg
      className="h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function TrendArrowDown() {
  return (
    <svg
      className="h-3.5 w-3.5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function StatCard({
  icon,
  value,
  label,
  trend,
  onClick,
  className = "",
}: StatCardProps) {
  const Wrapper = onClick ? "button" : "div"

  return (
    <Wrapper
      className={`flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm ${
        onClick
          ? "w-full cursor-pointer text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          : ""
      } ${className}`}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>

          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.positive ? <TrendArrowUp /> : <TrendArrowDown />}
              {trend.value}
            </span>
          )}
        </div>

        <p className="mt-0.5 text-sm text-gray-500">{label}</p>
      </div>
    </Wrapper>
  )
}
