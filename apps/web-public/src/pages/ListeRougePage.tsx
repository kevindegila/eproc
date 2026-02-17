export default function ListeRougePage() {
  const exclusions = [
    {
      entite: 'SARL BatiPlus Construction',
      nif: 'BJ-2019-84521',
      motif: 'Fraude documentaire lors de la soumission',
      decision: 'Decision ARMP n 2024-089',
      dateDebut: '15/06/2024',
      dateFin: '15/06/2027',
      duree: '3 ans',
    },
    {
      entite: 'ETS Fournitures Generales du Golfe',
      nif: 'BJ-2017-32145',
      motif: 'Defaillance grave dans l\'execution du marche',
      decision: 'Decision ARMP n 2024-076',
      dateDebut: '01/05/2024',
      dateFin: '01/05/2026',
      duree: '2 ans',
    },
    {
      entite: 'Global Tech Services SA',
      nif: 'BJ-2020-67890',
      motif: 'Pratiques collusoires entre soumissionnaires',
      decision: 'Decision ARMP n 2024-062',
      dateDebut: '10/03/2024',
      dateFin: '10/03/2029',
      duree: '5 ans',
    },
    {
      entite: 'Transport Express Atlantique',
      nif: 'BJ-2015-11234',
      motif: 'Fausses declarations de capacite technique',
      decision: 'Decision ARMP n 2023-145',
      dateDebut: '20/11/2023',
      dateFin: '20/11/2026',
      duree: '3 ans',
    },
    {
      entite: 'Societe Beninoise de Genie Civil',
      nif: 'BJ-2018-55678',
      motif: 'Abandon de chantier sans motif valable',
      decision: 'Decision ARMP n 2023-098',
      dateDebut: '01/08/2023',
      dateFin: '01/08/2025',
      duree: '2 ans',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Liste rouge — Entreprises exclues
        </h1>
        <p className="text-gray-600">
          Liste des operateurs economiques temporairement ou definitivement exclus
          de la commande publique par decision de l'Autorite de Regulation des
          Marches Publics (ARMP).
        </p>
      </div>

      {/* Warning notice */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-red-500 font-bold text-lg">!</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Avertissement
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Les entites figurant sur cette liste ne peuvent participer a aucune
              procedure de passation de marche public pendant la duree de leur
              exclusion. Toute soumission de leur part sera automatiquement rejetee.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Rechercher par nom d'entite ou IFU..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button className="px-4 py-2 text-sm bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors">
            Rechercher
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Entite</th>
              <th className="px-4 py-3">IFU</th>
              <th className="px-4 py-3">Motif d'exclusion</th>
              <th className="px-4 py-3">Decision</th>
              <th className="px-4 py-3">Debut</th>
              <th className="px-4 py-3">Fin</th>
              <th className="px-4 py-3">Duree</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exclusions.map((e) => (
              <tr key={e.nif} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{e.entite}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{e.nif}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">{e.motif}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{e.decision}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{e.dateDebut}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{e.dateFin}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                    {e.duree}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-600">
          {exclusions.length} entite{exclusions.length > 1 ? 's' : ''} exclue{exclusions.length > 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <button disabled className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-400 cursor-not-allowed">
            Precedent
          </button>
          <button disabled className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-400 cursor-not-allowed">
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
}
