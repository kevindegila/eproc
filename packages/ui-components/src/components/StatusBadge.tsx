interface StatusConfig {
  bg: string
  text: string
  label: string
}

const statusMap: Record<string, StatusConfig> = {
  en_attente: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "En attente",
  },
  en_cours: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "En cours",
  },
  approuve: {
    bg: "bg-green-50",
    text: "text-green-700",
    label: "Approuvé",
  },
  rejete: {
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Rejeté",
  },
  brouillon: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "Brouillon",
  },
  publie: {
    bg: "bg-green-50",
    text: "text-green-700",
    label: "Publié",
  },
  clos: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "Clos",
  },
  annule: {
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Annulé",
  },
  termine: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "Terminé",
  },
  actif: {
    bg: "bg-green-50",
    text: "text-green-700",
    label: "Actif",
  },
  suspendu: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Suspendu",
  },
  ouvert: {
    bg: "bg-green-50",
    text: "text-green-700",
    label: "Ouvert",
  },
  en_evaluation: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    label: "En évaluation",
  },
  attribue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "Attribué",
  },
}

const dotColorMap: Record<string, string> = {
  "text-amber-700": "bg-amber-500",
  "text-blue-700": "bg-blue-500",
  "text-green-700": "bg-green-500",
  "text-red-700": "bg-red-500",
  "text-gray-700": "bg-gray-500",
  "text-purple-700": "bg-purple-500",
}

interface StatusBadgeProps {
  status: string
  customLabel?: string
  customColor?: { bg: string; text: string }
  showDot?: boolean
  size?: "sm" | "md"
}

const sizeClasses: Record<string, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
}

export function StatusBadge({
  status,
  customLabel,
  customColor,
  showDot = false,
  size = "md",
}: StatusBadgeProps) {
  const config = statusMap[status]

  const bg = customColor?.bg ?? config?.bg ?? "bg-gray-100"
  const text = customColor?.text ?? config?.text ?? "text-gray-700"
  const label = customLabel ?? config?.label ?? status

  const dotColor = dotColorMap[text] ?? "bg-gray-500"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${bg} ${text} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
      )}
      {label}
    </span>
  )
}
