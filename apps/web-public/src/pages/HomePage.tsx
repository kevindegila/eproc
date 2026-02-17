import { Link } from 'react-router-dom'
import { useDACs, useOrganizations, LoadingSpinner } from '@eproc/api-client'

export default function HomePage() {
  const { data: dacsData, isLoading: dacsLoading } = useDACs({ status: 'PUBLIE' })
  const { data: orgsData } = useOrganizations()

  const dacs = (dacsData?.data || []) as Record<string, string | number>[]
  const orgs = (orgsData?.data || []) as Record<string, string>[]
  const latestDacs = dacs.slice(0, 3)

  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Portail de la Commande Publique du Benin
            </h1>
            <p className="text-lg text-green-100 mb-8 leading-relaxed">
              Plateforme officielle de dematerialisation des marches publics.
              Consultez les avis d'appels a concurrence, les plans previsionnels
              et soumettez vos offres en ligne en toute transparence.
            </p>
            {/* Search bar */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Rechercher un avis, un marche, une entite..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors">
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              {dacsLoading ? (
                <div className="h-9 flex items-center justify-center"><LoadingSpinner /></div>
              ) : (
                <p className="text-3xl font-bold text-green-700">{dacs.length}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">Avis en cours</p>
            </div>
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-green-700">{dacsData?.meta?.total || dacs.length || '--'}</p>
              <p className="text-sm text-gray-600 mt-1">Total marches publies</p>
            </div>
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-green-700">{orgs.length || '--'}</p>
              <p className="text-sm text-gray-600 mt-1">Autorites contractantes</p>
            </div>
            <div className="text-center p-4">
              <p className="text-3xl font-bold text-green-700">--</p>
              <p className="text-sm text-gray-600 mt-1">Soumissionnaires inscrits</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Acces rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/avis"
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all no-underline"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-700 text-xl font-bold">AC</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Avis d'appels a concurrence
            </h3>
            <p className="text-sm text-gray-600">
              Consultez les appels d'offres ouverts, les demandes de propositions
              et les avis de pre-qualification en cours.
            </p>
          </Link>

          <Link
            to="/plans"
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all no-underline"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-yellow-700 text-xl font-bold">PP</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Plans previsionnels
            </h3>
            <p className="text-sm text-gray-600">
              Accedez aux plans annuels de passation des marches publics des
              autorites contractantes.
            </p>
          </Link>

          <Link
            to="/denonciation"
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all no-underline"
          >
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-red-700 text-xl font-bold">SI</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Signaler une irregularite
            </h3>
            <p className="text-sm text-gray-600">
              Soumettez une denonciation anonyme conformement aux articles 170 et
              171 du Code des marches publics.
            </p>
          </Link>
        </div>
      </section>

      {/* Latest notices preview */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Derniers avis publies</h2>
            <Link
              to="/avis"
              className="text-sm font-medium text-green-700 hover:text-green-800 no-underline"
            >
              Voir tous les avis &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            {dacsLoading ? (
              <LoadingSpinner message="Chargement des avis..." />
            ) : latestDacs.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Objet</th>
                    <th className="px-4 py-3">Autorite contractante</th>
                    <th className="px-4 py-3">Date limite</th>
                    <th className="px-4 py-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {latestDacs.map((dac) => {
                    const ref = String(dac.reference || dac.ref || dac.id)
                    return (
                      <tr key={ref} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-green-700">{ref}</td>
                        <td className="px-4 py-3 text-gray-900">{String(dac.objet || dac.object || dac.title || '-')}</td>
                        <td className="px-4 py-3 text-gray-600">{String(dac.autoriteContractante || dac.organization || dac.entity || '-')}</td>
                        <td className="px-4 py-3 text-gray-600">{String(dac.dateLimite || dac.deadline || dac.closingDate || '-')}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {String(dac.type || dac.procedureType || '-')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-sm text-gray-500">Aucun avis publie pour le moment</div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
