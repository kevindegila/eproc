import type { ReactNode } from "react"

interface CardProps {
  title?: string
  headerAction?: ReactNode
  footer?: ReactNode
  hoverable?: boolean
  className?: string
  children: ReactNode
}

export function Card({
  title,
  headerAction,
  footer,
  hoverable = false,
  className = "",
  children,
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${
        hoverable ? "transition-shadow hover:shadow-md" : ""
      } ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          {title && (
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          )}
          {headerAction && (
            <div className="ml-auto flex items-center">{headerAction}</div>
          )}
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {footer && (
        <div className="border-t border-gray-200 px-6 py-4">{footer}</div>
      )}
    </div>
  )
}
