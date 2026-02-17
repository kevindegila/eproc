import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

interface Toast {
  id: string
  message: string
  variant: "success" | "error" | "warning" | "info"
  duration?: number
}

interface ToastContextValue {
  addToast: (
    message: string,
    variant?: Toast["variant"],
    duration?: number
  ) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error(
      "useToast doit être utilisé à l'intérieur d'un ToastProvider"
    )
  }
  return context
}

// --- Variant configuration ---

const variantStyles: Record<
  Toast["variant"],
  { container: string; icon: string }
> = {
  success: {
    container: "bg-green-50 border-green-400 text-green-800",
    icon: "text-green-500",
  },
  error: {
    container: "bg-red-50 border-red-400 text-red-800",
    icon: "text-red-500",
  },
  warning: {
    container: "bg-amber-50 border-amber-400 text-amber-800",
    icon: "text-amber-500",
  },
  info: {
    container: "bg-blue-50 border-blue-400 text-blue-800",
    icon: "text-blue-500",
  },
}

function SuccessIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0Zm-9-3.75h.008v.008H12V8.25Z"
      />
    </svg>
  )
}

const variantIcons: Record<Toast["variant"], () => ReactNode> = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
}

// --- Individual toast item ---

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Enter animation
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true)
      })
    })
  }, [])

  // Auto-dismiss
  useEffect(() => {
    const duration = toast.duration ?? 5000
    timerRef.current = setTimeout(() => {
      handleDismiss()
    }, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration, toast.id])

  function handleDismiss() {
    if (exiting) return
    setExiting(true)
    setVisible(false)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 200)
  }

  const styles = variantStyles[toast.variant]
  const Icon = variantIcons[toast.variant]

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex w-80 items-start gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-200 ${
        styles.container
      } ${
        visible && !exiting
          ? "translate-x-0 opacity-100"
          : "translate-x-8 opacity-0"
      }`}
    >
      <span className={`mt-0.5 flex-shrink-0 ${styles.icon}`}>
        <Icon />
      </span>

      <p className="flex-1 text-sm font-medium">{toast.message}</p>

      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
        aria-label="Fermer la notification"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

// --- Provider ---

let toastCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (
      message: string,
      variant: Toast["variant"] = "info",
      duration?: number
    ) => {
      const id = `toast-${++toastCounter}-${Date.now()}`
      setToasts((prev) => [...prev, { id, message, variant, duration }])
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container - bottom right */}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col-reverse gap-3"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
