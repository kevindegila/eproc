import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from "react"

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10 Mo

interface FileUploadProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
  files: File[]
  onChange: (files: File[]) => void
  label?: string
  helpText?: string
  error?: string
  progress?: number
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function getAcceptedExtensions(accept: string): string[] {
  return accept
    .split(",")
    .map((ext) => ext.trim().toLowerCase())
}

function isFileTypeAccepted(file: File, accept?: string): boolean {
  if (!accept) return true
  const extensions = getAcceptedExtensions(accept)
  const fileName = file.name.toLowerCase()
  return extensions.some((ext) => {
    if (ext.startsWith(".")) {
      return fileName.endsWith(ext)
    }
    // Support MIME types like "image/*" or "application/pdf"
    if (ext.includes("/")) {
      if (ext.endsWith("/*")) {
        const mimePrefix = ext.slice(0, -1)
        return file.type.startsWith(mimePrefix)
      }
      return file.type === ext
    }
    return false
  })
}

export function FileUpload({
  accept,
  maxSize = DEFAULT_MAX_SIZE,
  multiple = false,
  files,
  onChange,
  label = "Deposer vos fichiers ici",
  helpText,
  error: externalError,
  progress,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndAddFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newFiles: File[] = []
      const errors: string[] = []

      const fileArray = Array.from(incoming)

      for (const file of fileArray) {
        if (file.size > maxSize) {
          errors.push(
            `"${file.name}" : Fichier trop volumineux (${formatFileSize(file.size)}, maximum ${formatFileSize(maxSize)})`,
          )
          continue
        }
        if (!isFileTypeAccepted(file, accept)) {
          errors.push(
            `"${file.name}" : Type de fichier non accepte`,
          )
          continue
        }
        newFiles.push(file)
      }

      setValidationErrors(errors)

      if (newFiles.length > 0) {
        if (multiple) {
          onChange([...files, ...newFiles])
        } else {
          onChange([newFiles[0]])
        }
      }
    },
    [accept, files, maxSize, multiple, onChange],
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files)
      }
    },
    [validateAndAddFiles],
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndAddFiles(e.target.files)
      }
      // Reset input so the same file can be selected again
      e.target.value = ""
    },
    [validateAndAddFiles],
  )

  const handleRemoveFile = useCallback(
    (index: number) => {
      const updated = files.filter((_, i) => i !== index)
      onChange(updated)
      setValidationErrors([])
    },
    [files, onChange],
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [],
  )

  const displayError = externalError || (validationErrors.length > 0 ? validationErrors[0] : undefined)

  return (
    <div className="flex flex-col gap-2">
      {/* Zone de depot */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : displayError
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
        }`}
      >
        {/* Icone de telechargement */}
        <svg
          className={`h-10 w-10 ${isDragOver ? "text-blue-500" : "text-gray-400"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>

        <p className="text-sm font-medium text-gray-700">{label}</p>

        <p className="text-xs text-gray-500">
          ou{" "}
          <span className="font-semibold text-blue-600 underline">
            parcourir vos fichiers
          </span>
        </p>

        {helpText && (
          <p className="text-xs text-gray-400">{helpText}</p>
        )}

        {accept && (
          <p className="text-xs text-gray-400">
            Formats acceptes : {accept}
          </p>
        )}

        <p className="text-xs text-gray-400">
          Taille maximale : {formatFileSize(maxSize)}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Indicateur de progression */}
      {progress !== undefined && progress >= 0 && progress < 100 && (
        <div className="flex flex-col gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Envoi en cours... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Messages d'erreur */}
      {validationErrors.length > 0 && (
        <ul className="flex flex-col gap-1">
          {validationErrors.map((err, i) => (
            <li key={i} className="text-sm text-red-600">
              {err}
            </li>
          ))}
        </ul>
      )}

      {externalError && (
        <p className="text-sm text-red-600">{externalError}</p>
      )}

      {/* Liste des fichiers selectionnes */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {/* Icone de fichier */}
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>

                <div className="overflow-hidden">
                  <p className="truncate text-sm font-medium text-gray-700">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="ml-2 flex-shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label={`Supprimer ${file.name}`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
