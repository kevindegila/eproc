import { useDACs, useAppeals, useArbitrations, useDenunciations, LoadingSpinner } from '@eproc/api-client'

export default function StatistiquesPage() {
  const { data: dacsData, isLoading: dacsLoading } = useDACs()
  const { data: appealsData, isLoading: appealsLoading } = useAppeals()
  const { data: arbitrationsData } = useArbitrations()
  const { data: denunciationsData } = useDenunciations()

  const dacs = (dacsData?.data || []) as Record<string, string | number>[]
  const appeals = (appealsData?.data || []) as Record<string, string | number>[]
  const arbitrations = (arbitrationsData?.data || []) as Record<string, string | number>[]
  const denunciations = (denunciationsData?.data || []) as Record<string, string | number>[]

  const isLoading = dacsLoading || appealsLoading

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques et rapports</h1>
          <p className="text-sm text-gray-500 mt-1">Indicateurs de performance de la commande publique</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900/30">
            <option>Annee 2026</option>
            <option>Annee 2025</option>
            <option>Annee 2024</option>
          </select>
          <button className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Exporter
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Marches controles</p>
          {isLoading ? (
            <div className="mt-2"><LoadingSpinner /></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 mt-2">{dacs.length}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Recours traites</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{appeals.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Arbitrages</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{arbitrations.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Denonciations</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{denunciations.length}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart 1: Procurement by type */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Repartition par type de marche</h3>
          <div className="h-64 flex items-end justify-around gap-4 px-4 pb-4 border-b border-l border-gray-200 relative">
            <div className="absolute -left-0 top-0 bottom-0 flex flex-col justify-between py-2 text-[10px] text-gray-400">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            {(() => {
              const typeCount: Record<string, number> = {}
              dacs.forEach((d) => {
                const type = String(d.type || d.marketType || d.procedureType || 'Autre')
                typeCount[type] = (typeCount[type] || 0) + 1
              })
              const total = dacs.length || 1
              const colors = ['bg-red-900', 'bg-red-700', 'bg-red-500', 'bg-red-400', 'bg-red-300']
              return Object.entries(typeCount).slice(0, 5).map(([label, count], i) => {
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={label} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-semibold text-gray-700">{pct}%</span>
                    <div
                      className={`w-full max-w-12 ${colors[i] || 'bg-red-300'} rounded-t-md transition-all`}
                      style={{ height: `${(pct / 100) * 220}px` }}
                    />
                    <span className="text-xs text-gray-500 mt-1 truncate max-w-full">{label}</span>
                  </div>
                )
              })
            })()}
            {dacs.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Aucune donnee</div>
            )}
          </div>
        </div>

        {/* Chart 2: Appeal outcomes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Resultats des recours</h3>
          <div className="space-y-3">
            {(() => {
              const statusCount: Record<string, number> = {}
              appeals.forEach((a) => {
                const status = String(a.status || a.statut || 'Inconnu')
                statusCount[status] = (statusCount[status] || 0) + 1
              })
              const total = appeals.length || 1
              const colors: Record<string, string> = {
                'Decision rendue': 'bg-green-500',
                'Tranche': 'bg-green-500',
                'Instruction': 'bg-blue-500',
                'En cours': 'bg-blue-500',
                'Rejete': 'bg-red-500',
                'Classe': 'bg-gray-400',
              }
              return Object.entries(statusCount).map(([label, count]) => {
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{label}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${colors[label] || 'bg-gray-400'} h-2 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            })()}
            {appeals.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-8">Aucune donnee de recours</div>
            )}
          </div>
        </div>

        {/* Chart 3: DAC status distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Statut des DAC</h3>
          <div className="space-y-3">
            {(() => {
              const statusCount: Record<string, number> = {}
              dacs.forEach((d) => {
                const status = String(d.status || d.statut || 'Inconnu')
                statusCount[status] = (statusCount[status] || 0) + 1
              })
              const total = dacs.length || 1
              const colors: Record<string, string> = {
                'BROUILLON': 'bg-gray-400',
                'PUBLIE': 'bg-blue-500',
                'CLOTURE': 'bg-green-500',
                'ANNULE': 'bg-red-500',
              }
              return Object.entries(statusCount).map(([label, count]) => {
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{label}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${colors[label] || 'bg-gray-400'} h-2 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            })()}
            {dacs.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-8">Aucune donnee de DAC</div>
            )}
          </div>
        </div>

        {/* Chart 4: Denunciations summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Denonciations par statut</h3>
          <div className="space-y-3">
            {(() => {
              const statusCount: Record<string, number> = {}
              denunciations.forEach((d) => {
                const status = String(d.status || d.statut || 'Inconnu')
                statusCount[status] = (statusCount[status] || 0) + 1
              })
              const total = denunciations.length || 1
              const colors: Record<string, string> = {
                'Nouveau': 'bg-red-500',
                'En examen': 'bg-blue-500',
                'Enquete': 'bg-purple-500',
                'Cloture': 'bg-gray-400',
              }
              return Object.entries(statusCount).map(([label, count]) => {
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{label}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${colors[label] || 'bg-gray-400'} h-2 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            })()}
            {denunciations.length === 0 && (
              <div className="text-center text-sm text-gray-400 py-8">Aucune denonciation</div>
            )}
          </div>
        </div>
      </div>

      {/* Summary counts */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Resume global</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-900">{dacs.length}</p>
            <p className="text-sm text-gray-500 mt-1">DAC total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-900">{dacs.filter(d => String(d.status || d.statut || '') === 'PUBLIE').length}</p>
            <p className="text-sm text-gray-500 mt-1">DAC publies</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-900">{appeals.length}</p>
            <p className="text-sm text-gray-500 mt-1">Recours total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-900">{arbitrations.length + denunciations.length}</p>
            <p className="text-sm text-gray-500 mt-1">Litiges et denonciations</p>
          </div>
        </div>
      </div>
    </div>
  )
}
