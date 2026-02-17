import { forwardRef, type ReactNode, type ButtonHTMLAttributes, type ElementType } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  as?: ElementType
  href?: string
  to?: string
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/40 border border-transparent",
  secondary:
    "bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500/20 border border-gray-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40 border border-transparent",
  success:
    "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/40 border border-transparent",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500/20 border border-transparent",
}

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
}

function Spinner({ size }: { size: string }) {
  const dimension = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
  return (
    <svg
      className={`${dimension} animate-spin`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = "",
      children,
      as,
      ...rest
    },
    ref,
  ) {
    const Component = as || "button"

    const isDisabled = disabled || loading

    const classes = [
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2",
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? "w-full" : "",
      isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ")

    return (
      <Component
        ref={ref}
        className={classes}
        disabled={Component === "button" ? isDisabled : undefined}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && <Spinner size={size} />}
        {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </Component>
    )
  },
)
