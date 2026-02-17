import { Link } from 'react-router-dom'
import { useDACs, LoadingSpinner, QueryError } from '@eproc/api-client'

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  'SOUMIS': { label: 'Soumis', classes: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'EN_EXAMEN': { label: 'En examen', classes: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  'APPROUVE': { label: 'Approuve', classes: 'bg-green-100 text-green-800 border-green-200' },
  'REJETE': { label: 'Rejete', classes: 'bg-red-100 text-red-800 border-red-200' },
  'PUBLIE': { label: 'Publie', classes: 'bg-blue-100 text-blue-800 border-blue-200' },
}

function StatusBadge({ statut }: { statut: string }) {
  const cfg = STATUS_CONFIG[statut]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${cfg?.classes || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {cfg?.label || statut}
    </span>
  )
}

export default function ControlePage() {
  const { data: dacsData, isLoading, error, refetch } = useDACs()

  // Exclure les brouillons — le portail DNCMP ne voit que les DAC soumis+
  const allDacs = (dacsData?.data || []) as Record<string, string>[]
  const dacs = allDacs.filter((d) => (d.status || '') !== 'BROUILLON')

  if (isLoading) {
    return <LoadingSpinner message="Chargement des DAC..." />
  }

  if (error) {
    return <QueryError message="Impossible de charger les dossiers d'appel a concurrence." onRetry={refetch} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle a priori des DAC</h1>
          <p className="text-sm text-gray-500 mt-1">Examen de conformite des dossiers d'appel a concurrence (DNCMP)</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900/30">
            <option>Tous les statuts</option>
            <option>SOUMIS</option>
            <option>EN_EXAMEN</option>
            <option>APPROUVE</option>
            <option>REJETE</option>
            <option>PUBLIE</option>
          </select>
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-900/30">
            <option>Tous les types</option>
            <option>AOO</option>
            <option>AOI</option>
            <option>Consultation</option>
            <option>Gre a gre</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total DAC</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{dacs.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Soumis / En examen</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {dacs.filter((d) => ['SOUMIS', 'EN_EXAMEN'].includes(d.status || '')).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Approuves</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {dacs.filter((d) => (d.status || '') === 'APPROUVE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Rejetes</p>
          <p className="text-2xl font-bold text-red-700 mt-1">
            {dacs.filter((d) => (d.status || '') === 'REJETE').length}
          </p>
        </div>
      </div>

      {/* DAC Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          {dacs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Autorite contractante</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Objet</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dacs.map((dac) => {
                  const ref = dac.reference || dac.ref || dac.id
                  const status = dac.status || dac.statut || '-'
                  return (
                    <tr key={dac.id || dac.ref} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link to={`/controle/${dac.id || ref}`} className="text-sm font-medium text-red-900 hover:underline">
                          {ref}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">{dac.contractingAuthority || dac.ac || '-'}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 max-w-xs truncate">{dac.objet || dac.object || dac.title || '-'}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{dac.type || dac.procurementType || '-'}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">{dac.montant || dac.amount || dac.estimatedAmount || '-'}</td>
                      <td className="px-5 py-3"><StatusBadge statut={status} /></td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/controle/${dac.id || ref}`}
                            className="text-xs font-medium px-3 py-1.5 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors"
                          >
                            Examiner
                          </Link>
                          {(['SOUMIS', 'EN_EXAMEN'].includes(status)) && (
                            <>
                              <button className="text-xs font-medium px-3 py-1.5 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors">
                                Approuver
                              </button>
                              <button className="text-xs font-medium px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">
                                Rejeter
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-12 text-center text-sm text-gray-500">Aucun dossier d'appel a concurrence trouve</div>
          )}
        </div>
      </div>
    </div>
  )
}
