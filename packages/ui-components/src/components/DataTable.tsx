import { useState, useMemo, useCallback, type ReactNode } from "react"

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface Column<T> {
  /** Property key used to read a primitive value from the row object when no
   *  custom `render` function is provided. Also serves as a stable identifier
   *  for the column. */
  key: string
  /** Visible column header text (French). */
  header: string
  /** Optional custom cell renderer. When omitted the component falls back to
   *  `String(item[key])`. */
  render?: (item: T) => ReactNode
  /** Whether clicking the column header toggles sorting. @default false */
  sortable?: boolean
  /** Extra Tailwind classes forwarded to both the `<th>` and every `<td>` of
   *  this column. */
  className?: string
}

export interface RowAction<T> {
  /** Label shown inside the action button. */
  label: string
  /** Callback fired when the action is triggered. */
  onClick: (item: T) => void
  /** Optional Tailwind classes applied to the action button. */
  className?: string
  /** When provided, the action button is hidden for rows where this returns
   *  `false`. */
  hidden?: (item: T) => boolean
}

export interface DataTableProps<T> {
  /** Column definitions. */
  columns: Column<T>[]
  /** Row data array. */
  data: T[]
  /** When `true` the table body is replaced by animated skeleton rows. */
  loading?: boolean
  /** Message displayed when `data` is empty and the table is not loading.
   *  @default "Aucune donnee disponible" */
  emptyMessage?: string
  /** Number of rows per page. Pass `0` or `Infinity` to disable pagination.
   *  @default 10 */
  pageSize?: number
  /** Fired when a row is clicked. When provided the rows gain a pointer
   *  cursor and a hover highlight. */
  onRowClick?: (item: T) => void
  /** Stable unique key extractor used for React `key` props. */
  keyExtractor: (item: T) => string | number
  /** Enable alternating row background colours.
   *  @default false */
  striped?: boolean
  /** Optional set of per-row action buttons rendered in a trailing "Actions"
   *  column. */
  actions?: RowAction<T>[]
}

// ---------------------------------------------------------------------------
// Sort direction type
// ---------------------------------------------------------------------------

type SortDirection = "asc" | "desc"

interface SortState {
  key: string
  direction: SortDirection
}

// ---------------------------------------------------------------------------
// Small internal helpers
// ---------------------------------------------------------------------------

/** Read a (possibly nested) value from an object by dot-separated key. */
function readByKey(obj: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc !== null && acc !== undefined && typeof acc === "object") {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

/** Default compare used for sorting. Handles strings, numbers and dates. */
function defaultCompare(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1

  if (typeof a === "number" && typeof b === "number") return a - b
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()

  return String(a).localeCompare(String(b), "fr", { sensitivity: "base" })
}

// ---------------------------------------------------------------------------
// Sort indicator icon (pure CSS / Tailwind, no external deps)
// ---------------------------------------------------------------------------

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (direction === null) {
    // Neutral / unsorted indicator
    return (
      <span className="ml-1 inline-flex flex-col text-[10px] leading-none text-gray-400">
        <span>&#9650;</span>
        <span>&#9660;</span>
      </span>
    )
  }

  return (
    <span className="ml-1 inline-flex flex-col text-[10px] leading-none">
      <span className={direction === "asc" ? "text-gray-900" : "text-gray-300"}>
        &#9650;
      </span>
      <span className={direction === "desc" ? "text-gray-900" : "text-gray-300"}>
        &#9660;
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Skeleton row used during the loading state
// ---------------------------------------------------------------------------

function SkeletonRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      {Array.from({ length: colSpan }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Pagination bar
// ---------------------------------------------------------------------------

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  /** Build the visible page number buttons. Shows at most 7 slots with
   *  ellipsis when the page count is large. */
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (currentPage > 3) pages.push("ellipsis")

      const rangeStart = Math.max(2, currentPage - 1)
      const rangeEnd = Math.min(totalPages - 1, currentPage + 1)
      for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i)

      if (currentPage < totalPages - 2) pages.push("ellipsis")

      pages.push(totalPages)
    }

    return pages
  }, [currentPage, totalPages])

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-gray-600">
        Affichage de <span className="font-medium">{start}</span> a{" "}
        <span className="font-medium">{end}</span> sur{" "}
        <span className="font-medium">{totalItems}</span> resultats
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Previous */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Page precedente"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.79 14.71a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.06l4.25-4.25a.75.75 0 111.06 1.06L9.06 10l3.73 3.71a.75.75 0 010 1.06z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">Precedent</span>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, idx) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1 text-sm text-gray-400 select-none"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`min-w-[32px] rounded-md px-2 py-1 text-center text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.21 5.29a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 11-1.06-1.06L10.94 10 7.21 6.29a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </nav>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DataTable component
// ---------------------------------------------------------------------------

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "Aucune donnee disponible",
  pageSize = 10,
  onRowClick,
  keyExtractor,
  striped = false,
  actions,
}: DataTableProps<T>) {
  // -- Sorting state --------------------------------------------------------
  const [sort, setSort] = useState<SortState | null>(null)

  const handleSort = useCallback(
    (key: string) => {
      setSort((prev) => {
        if (prev?.key === key) {
          return prev.direction === "asc"
            ? { key, direction: "desc" }
            : null // third click resets
        }
        return { key, direction: "asc" }
      })
      // Reset to first page when sort changes
      setCurrentPage(1)
    },
    [],
  )

  // -- Sorted data ----------------------------------------------------------
  const sortedData = useMemo(() => {
    if (!sort) return data

    const { key, direction } = sort
    const sorted = [...data].sort((a, b) => {
      const va = readByKey(a, key)
      const vb = readByKey(b, key)
      const cmp = defaultCompare(va, vb)
      return direction === "asc" ? cmp : -cmp
    })
    return sorted
  }, [data, sort])

  // -- Pagination state -----------------------------------------------------
  const paginationEnabled = pageSize > 0 && isFinite(pageSize)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = paginationEnabled
    ? Math.max(1, Math.ceil(sortedData.length / pageSize))
    : 1

  // Clamp current page when data shrinks
  const safePage = Math.min(currentPage, totalPages)
  if (safePage !== currentPage) {
    // Will be applied on the next render cycle
    setCurrentPage(safePage)
  }

  const pageData = paginationEnabled
    ? sortedData.slice((safePage - 1) * pageSize, safePage * pageSize)
    : sortedData

  // -- Derived values -------------------------------------------------------
  const hasActions = actions !== undefined && actions.length > 0
  const totalColSpan = columns.length + (hasActions ? 1 : 0)

  // -- Render ---------------------------------------------------------------
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Horizontal scroll wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          {/* ------ Header ------ */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key
                const direction = isSorted ? sort.direction : null

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 ${
                      col.sortable ? "cursor-pointer select-none hover:text-gray-900" : ""
                    } ${col.className ?? ""}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    aria-sort={
                      isSorted
                        ? direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.header}
                      {col.sortable && <SortIcon direction={direction} />}
                    </span>
                  </th>
                )
              })}

              {hasActions && (
                <th
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* ------ Body ------ */}
          <tbody className="divide-y divide-gray-100">
            {/* Loading skeleton */}
            {loading &&
              Array.from({ length: paginationEnabled ? pageSize : 5 }, (_, i) => (
                <SkeletonRow key={`skeleton-${i}`} colSpan={totalColSpan} />
              ))}

            {/* Empty state */}
            {!loading && sortedData.length === 0 && (
              <tr>
                <td
                  colSpan={totalColSpan}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Empty-state icon */}
                    <svg
                      className="h-10 w-10 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading &&
              pageData.map((item, rowIndex) => {
                const rowKey = keyExtractor(item)
                const isEven = rowIndex % 2 === 0

                return (
                  <tr
                    key={rowKey}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    className={[
                      "transition-colors",
                      onRowClick ? "cursor-pointer" : "",
                      striped && !isEven ? "bg-gray-50/60" : "bg-white",
                      "hover:bg-blue-50/60",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {columns.map((col) => {
                      const cellContent = col.render
                        ? col.render(item)
                        : String(readByKey(item, col.key) ?? "")

                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-gray-800 ${col.className ?? ""}`}
                        >
                          {cellContent}
                        </td>
                      )
                    })}

                    {hasActions && (
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          {actions.map((action) => {
                            if (action.hidden?.(item)) return null
                            return (
                              <button
                                key={action.label}
                                type="button"
                                onClick={(e) => {
                                  // Prevent the row click from firing
                                  e.stopPropagation()
                                  action.onClick(item)
                                }}
                                className={
                                  action.className ??
                                  "rounded-md px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 transition-colors hover:bg-blue-50"
                                }
                              >
                                {action.label}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {/* ------ Pagination ------ */}
      {!loading && paginationEnabled && sortedData.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={sortedData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
