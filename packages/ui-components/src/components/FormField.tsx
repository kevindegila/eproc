import type { ReactNode } from "react"

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  helpText?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  required = false,
  error,
  helpText,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!error && helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}
