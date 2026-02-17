import { useState, useRef, useEffect } from 'react'
import { useSearchPpmEntries } from '@eproc/api-client'

interface PpmEntryResult {
  id: string
  referenceCode: string | null
  description: string
  marketType: string
  method: string
  estimatedAmount: number
  fundingSource: string | null
  plan?: { reference: string; fiscalYear: number; version: number }
}

function mapMarketType(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('fourniture')) return 'fournitures'
  if (lower.includes('travaux')) return 'travaux'
  if (lower.includes('prestation') || lower.includes('intellectuel')) return 'pi'
  if (lower.includes('service')) return 'services'
  return ''
}

function mapProcurementMethod(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('appel') && lower.includes('ouvert')) return 'aoo'
  if (lower.includes('appel') && lower.includes('restreint')) return 'aor'
  if (lower.includes('cotation')) return 'dc'
  if (lower.includes('renseignement') || lower.includes('drp')) return 'dc'
  if (lower.includes('gre')) return 'gre'
  return ''
}

function mapFundingSource(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('national') || lower === 'bn') return 'bn'
  if (lower.includes('autonome') || lower === 'ba') return 'bn'
  if (lower.includes('mixte')) return 'ext'
  if (lower.includes('ext')) return 'ext'
  return ''
}

interface Props {
  formData: Record<string, string>
  updateField: (field: string, value: string) => void
}

export default function StepInformationsGenerales({ formData, updateField }: Props) {
  const [ppmSearch, setPpmSearch] = useState(formData.ppmReference || '')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: searchResults, isFetching } = useSearchPpmEntries(ppmSearch)

  const results: PpmEntryResult[] = Array.isArray(searchResults) ? searchResults : []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectEntry = (entry: PpmEntryResult) => {
    updateField('ppmReference', entry.referenceCode || '')
    updateField('subject', entry.description)
    updateField('marketType', mapMarketType(entry.marketType))
    updateField('procurementMethod', mapProcurementMethod(entry.method))
    updateField('estimatedAmount', String(entry.estimatedAmount || ''))
    updateField('fundingSource', mapFundingSource(entry.fundingSource || ''))
    setPpmSearch(entry.referenceCode || '')
    setShowDropdown(false)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Etape 1 : Informations generales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PPM Reference */}
        <div className="md:col-span-2 relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference PPM
          </label>
          <div className="relative">
            <input
              type="text"
              value={ppmSearch}
              onChange={(e) => {
                setPpmSearch(e.target.value)
                updateField('ppmReference', e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => { if (ppmSearch.length >= 2) setShowDropdown(true) }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tapez une reference PPM (ex: F_DAF_116458)..."
            />
            {isFetching && (
              <div className="absolute right-3 top-2.5">
                <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>
          {showDropdown && ppmSearch.length >= 2 && results.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {results.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleSelectEntry(entry)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-medium text-blue-700">{entry.referenceCode}</span>
                    <span className="text-xs text-gray-500">
                      {entry.plan ? `${entry.plan.reference}` : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">{entry.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{entry.marketType}</span>
                    <span className="text-xs text-gray-500">{new Intl.NumberFormat('fr-FR').format(entry.estimatedAmount)} FCFA</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {showDropdown && ppmSearch.length >= 2 && !isFetching && results.length === 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-500 text-center">Aucune reference trouvee</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">Tapez une reference pour auto-remplir les champs ci-dessous</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Objet du marche</label>
          <textarea
            rows={3}
            value={formData.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Decrivez l'objet du marche..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de marche</label>
          <select
            value={formData.marketType}
            onChange={(e) => updateField('marketType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selectionner...</option>
            <option value="fournitures">Fournitures</option>
            <option value="travaux">Travaux</option>
            <option value="services">Services courants</option>
            <option value="pi">Prestations intellectuelles</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode de passation</label>
          <select
            value={formData.procurementMethod}
            onChange={(e) => updateField('procurementMethod', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selectionner...</option>
            <option value="aoo">Appel d'offres ouvert</option>
            <option value="aor">Appel d'offres restreint</option>
            <option value="dc">Demande de cotation</option>
            <option value="gre">Marche de gre a gre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Montant estime (FCFA)
          </label>
          <input
            type="text"
            value={formData.estimatedAmount}
            onChange={(e) => updateField('estimatedAmount', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source de financement</label>
          <select
            value={formData.fundingSource}
            onChange={(e) => updateField('fundingSource', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selectionner...</option>
            <option value="bn">Budget national</option>
            <option value="pti">Programme de transfert / investissement</option>
            <option value="ext">Financement exterieur</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delai d'execution (jours)
          </label>
          <input
            type="number"
            value={formData.executionDelay}
            onChange={(e) => updateField('executionDelay', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="90"
          />
        </div>
      </div>
    </div>
  )
}
