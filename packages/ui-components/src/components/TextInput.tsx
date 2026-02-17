import { forwardRef, type ReactNode, type InputHTMLAttributes } from "react"

interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "prefix" | "suffix"> {
  type?: "text" | "email" | "tel" | "number" | "password" | "url"
  prefix?: ReactNode
  suffix?: ReactNode
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { type = "text", prefix, suffix, className = "", disabled, ...rest },
    ref,
  ) {
    return (
      <div
        className={`flex items-center rounded-md border bg-white transition-colors ${
          disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
        } ${className}`}
      >
        {prefix && (
          <span className="flex items-center pl-3 text-gray-400">
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={`w-full rounded-md bg-transparent px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none disabled:cursor-not-allowed disabled:text-gray-500 ${
            prefix ? "pl-2" : ""
          } ${suffix ? "pr-2" : ""}`}
          {...rest}
        />

        {suffix && (
          <span className="flex items-center pr-3 text-gray-400">
            {suffix}
          </span>
        )}
      </div>
    )
  },
)
