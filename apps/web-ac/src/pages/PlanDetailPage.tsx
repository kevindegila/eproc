import { useState, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForecastPlan, useUploadPPM, useSubmitPlan, usePublishPlan, useAuth, LoadingSpinner, QueryError } from '@eproc/api-client'

interface MarketEntryData {
  id: string
  lineNumber: number
  referenceCode: string | null
  description: string
  marketType: string
  method: string
  estimatedAmount: number
  fundingSource: string | null
  budgetLine: string | null
  controlBody: string | null
  launchAuthDate: string | null
  category: string | null
}

const statutColors: Record<string, string> = {
  BROUILLON: 'bg-gray-100 text-gray-700',
  SOUMIS: 'bg-blue-100 text-blue-700',
  VALIDE: 'bg-emerald-100 text-emerald-700',
  PUBLIE: 'bg-green-100 text-green-800',
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    BROUILLON: 'Brouillon',
    SOUMIS: 'Soumis',
    VALIDE: 'Valide',
    PUBLIE: 'Publie',
  }
  return map[status] || status
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount) + ' FCFA'
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) {
    return (
      <svg className="inline ml-1 h-3 w-3 text-gray-300" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 2l3 4H3zM6 10L3 6h6z" />
      </svg>
    )
  }
  return (
    <svg className="inline ml-1 h-3 w-3 text-blue-600" viewBox="0 0 12 12" fill="currentColor">
      {dir === 'asc' ? <path d="M6 2l4 5H2z" /> : <path d="M6 10L2 5h8z" />}
    </svg>
  )
}

export default function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: plan, isLoading, isError, refetch } = useForecastPlan(planId || '')
  const uploadMutation = useUploadPPM()
  const submitMutation = useSubmitPlan()
  const publishMutation = usePublishPlan()

  const [showReimportModal, setShowReimportModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterMode, setFilterMode] = useState('')
  const [filterSource, setFilterSource] = useState('')

  type SortKey = 'lineNumber' | 'marketType' | 'method' | 'estimatedAmount' | 'fundingSource' | 'launchAuthDate'
  const [sortKey, setSortKey] = useState<SortKey | ''>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const entries: MarketEntryData[] = plan?.entries || []

  const uniqueTypes = useMemo(() => [...new Set(entries.map((e) => e.marketType).filter(Boolean))].sort(), [entries])
  const uniqueModes = useMemo(() => [...new Set(entries.map((e) => e.method).filter(Boolean))].sort(), [entries])
  const uniqueSources = useMemo(() => [...new Set(entries.map((e) => e.fundingSource).filter((v): v is string => !!v))].sort(), [entries])

  const filteredEntries = useMemo(() => {
    let result = entries
    if (searchText) {
      const q = searchText.toLowerCase()
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          (e.referenceCode && e.referenceCode.toLowerCase().includes(q)),
      )
    }
    if (filterType) result = result.filter((e) => e.marketType === filterType)
    if (filterMode) result = result.filter((e) => e.method === filterMode)
    if (filterSource) result = result.filter((e) => e.fundingSource === filterSource)

    if (sortKey) {
      const parseDate = (v: string): number => {
        const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/)
        if (m) return parseInt(m[3] + m[2] + m[1], 10)
        const m2 = v.match(/^(\d{4})-(\d{2})-(\d{2})$/)
        if (m2) return parseInt(m2[1] + m2[2] + m2[3], 10)
        return 0
      }

      result = [...result].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal
        }
        if (sortKey === 'launchAuthDate') {
          const da = parseDate(String(aVal))
          const db = parseDate(String(bVal))
          if (da && db) return sortDir === 'asc' ? da - db : db - da
        }
        const cmp = String(aVal).localeCompare(String(bVal))
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return result
  }, [entries, searchText, filterType, filterMode, filterSource, sortKey, sortDir])

  const hasActiveFilters = searchText || filterType || filterMode || filterSource

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setUploadError(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.xlsx')) {
      handleFileSelect(file)
    } else {
      setUploadError('Seuls les fichiers .xlsx sont acceptes')
    }
  }, [handleFileSelect])

  const handleReimport = async () => {
    if (!selectedFile || !plan) return
    setUploadError(null)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('fiscalYear', String(plan.fiscalYear))
    if (user?.organization?.name) {
      formData.append('organizationName', user.organization.name)
    }

    try {
      await uploadMutation.mutateAsync(formData)
      setShowReimportModal(false)
      setSelectedFile(null)
      refetch()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setUploadError(msg || 'Erreur lors de la reimportation')
    }
  }

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !plan) {
    return (
      <div>
        <button onClick={() => navigate('/planification')} className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux plans
        </button>
        <QueryError onRetry={refetch} />
      </div>
    )
  }

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => navigate('/planification')}
        className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour aux plans
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{plan.reference}</h1>
            <p className="text-sm text-gray-500 mt-1">{plan.title}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm text-gray-600">
                Exercice: <span className="font-medium">{plan.fiscalYear}</span>
              </span>
              <span className="text-sm text-gray-600">
                Version: <span className="font-medium">V{plan.version || 1}</span>
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statutColors[plan.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {formatStatus(plan.status)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {plan.status === 'BROUILLON' && (
              <>
                <button
                  onClick={() => setShowReimportModal(true)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reimporter
                </button>
                <button
                  onClick={() => submitMutation.mutate(plan.id, { onSuccess: () => refetch() })}
                  disabled={submitMutation.isPending}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitMutation.isPending ? 'Soumission...' : 'Soumettre'}
                </button>
              </>
            )}
            {plan.status !== 'PUBLIE' && (
              <button
                onClick={() => publishMutation.mutate(plan.id, { onSuccess: () => refetch() })}
                disabled={publishMutation.isPending}
                className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {publishMutation.isPending ? 'Publication...' : 'Publier'}
              </button>
            )}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Montant Total</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{formatAmount(plan.totalAmount || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Entrees</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{entries.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Fichier source</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{plan.fileName || '\u2014'}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Recherche</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Description ou reference..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Mode</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              {uniqueModes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Source</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              {uniqueSources.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearchText(''); setFilterType(''); setFilterMode(''); setFilterSource('') }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Reinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12 cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('lineNumber')}
                >
                  N<SortIcon active={sortKey === 'lineNumber'} dir={sortDir} />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[250px]">
                  Description
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('marketType')}
                >
                  Type<SortIcon active={sortKey === 'marketType'} dir={sortDir} />
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('method')}
                >
                  Mode<SortIcon active={sortKey === 'method'} dir={sortDir} />
                </th>
                <th
                  className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('estimatedAmount')}
                >
                  Montant (FCFA)<SortIcon active={sortKey === 'estimatedAmount'} dir={sortDir} />
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('fundingSource')}
                >
                  Source<SortIcon active={sortKey === 'fundingSource'} dir={sortDir} />
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700"
                  onClick={() => toggleSort('launchAuthDate')}
                >
                  Date lancement DAO<SortIcon active={sortKey === 'launchAuthDate'} dir={sortDir} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                    {hasActiveFilters ? 'Aucune entree ne correspond aux filtres' : 'Aucune entree'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500">{entry.lineNumber}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{entry.referenceCode || '\u2014'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.marketType}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {entry.method || '\u2014'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {new Intl.NumberFormat('fr-FR').format(entry.estimatedAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.fundingSource || '\u2014'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.launchAuthDate || '\u2014'}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredEntries.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                    Total ({filteredEntries.length}{hasActiveFilters ? ` / ${entries.length}` : ''} entrees)
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                    {new Intl.NumberFormat('fr-FR').format(
                      filteredEntries.reduce((s, e) => s + (e.estimatedAmount || 0), 0),
                    )}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Reimport Modal */}
      {showReimportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowReimportModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Reimporter le PPM</h2>
              <button onClick={() => setShowReimportModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Le plan sera mis a jour avec la version V{(plan.version || 1) + 1}. Les entrees actuelles seront remplacees.
            </p>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} Ko</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                    className="text-xs text-red-500 hover:text-red-700 mt-2"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">Glissez-deposez votre fichier PPM ici</p>
                  <p className="text-xs text-gray-400 mt-1">ou cliquez pour parcourir (format .xlsx)</p>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReimportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReimport}
                disabled={!selectedFile || uploadMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2a4d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Reimportation...
                  </>
                ) : (
                  'Reimporter'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
