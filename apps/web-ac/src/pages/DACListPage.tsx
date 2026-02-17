import { useNavigate } from 'react-router-dom'
import { useDACs, LoadingSpinner, QueryError } from '@eproc/api-client'

const statutColors: Record<string, string> = {
  'draft': 'bg-gray-100 text-gray-700',
  'Brouillon': 'bg-gray-100 text-gray-700',
  'pending': 'bg-yellow-100 text-yellow-700',
  'En validation': 'bg-yellow-100 text-yellow-700',
  'validated': 'bg-emerald-100 text-emerald-700',
  'Valide': 'bg-emerald-100 text-emerald-700',
  'published': 'bg-blue-100 text-blue-700',
  'Publie': 'bg-blue-100 text-blue-700',
  'closed': 'bg-red-100 text-red-700',
  'Clos': 'bg-red-100 text-red-700',
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    draft: 'Brouillon',
    pending: 'En validation',
    validated: 'Valide',
    published: 'Publie',
    closed: 'Clos',
  }
  return map[status] || status
}

export default function DACListPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useDACs()

  const dacs = data?.data ?? []
  const meta = data?.meta

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dossiers d'appel a concurrence</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerez vos dossiers d'appel d'offres et de consultation
            </p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dossiers d'appel a concurrence</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerez vos dossiers d'appel d'offres et de consultation
            </p>
          </div>
        </div>
        <QueryError onRetry={refetch} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dossiers d'appel a concurrence</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerez vos dossiers d'appel d'offres et de consultation
          </p>
        </div>
        <button
          onClick={() => navigate('/dac/nouveau')}
          className="bg-[#1e3a5f] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a4d7a] transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Nouveau DAC
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Recherche</label>
            <input
              type="text"
              placeholder="Reference ou objet..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous</option>
              <option value="aoo">Appel d'offres ouvert</option>
              <option value="aor">Appel d'offres restreint</option>
              <option value="dc">Demande de cotation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous</option>
              <option value="brouillon">Brouillon</option>
              <option value="en_validation">En validation</option>
              <option value="valide">Valide</option>
              <option value="publie">Publie</option>
              <option value="clos">Clos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Objet
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date limite
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dacs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    Aucun dossier d'appel a concurrence trouve
                  </td>
                </tr>
              ) : (
                dacs.map((dac: Record<string, unknown>) => {
                  const status = String(dac.status || dac.statut || 'draft')
                  const reference = String(dac.reference || dac.id || '')
                  const objet = String(dac.subject || dac.objet || '')
                  const type = String(dac.procurementMethod || dac.type || '')
                  const dateLimite = dac.submissionDeadline || dac.dateLimite || null
                  const isDraft = status === 'draft' || status === 'Brouillon'
                  return (
                    <tr key={String(dac.id)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{reference}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {objet}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{type}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statutColors[status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {formatStatus(status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {dateLimite ? String(dateLimite) : '\u2014'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            Voir
                          </button>
                          {isDraft && (
                            <button className="text-sm text-amber-600 hover:text-amber-800 font-medium">
                              Modifier
                            </button>
                          )}
                          {isDraft && (
                            <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                              Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Affichage de <span className="font-medium">1</span> a{' '}
            <span className="font-medium">{dacs.length}</span> sur{' '}
            <span className="font-medium">{meta?.total ?? dacs.length}</span> resultats
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50">
              Precedent
            </button>
            <button className="px-3 py-1.5 text-sm border border-blue-500 rounded-lg bg-blue-500 text-white">
              1
            </button>
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-500 hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
