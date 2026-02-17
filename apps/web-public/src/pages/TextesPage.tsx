export default function TextesPage() {
  const categories = [
    {
      titre: 'Lois et ordonnances',
      documents: [
        {
          titre: 'Loi n 2020-26 du 29 septembre 2020 portant Code des marches publics en Republique du Benin',
          date: '29/09/2020',
          type: 'PDF',
        },
        {
          titre: 'Loi n 2009-02 du 07 aout 2009 portant Code des marches publics et des delegations de service public (abrogee)',
          date: '07/08/2009',
          type: 'PDF',
        },
      ],
    },
    {
      titre: 'Decrets d\'application',
      documents: [
        {
          titre: 'Decret 2025-169 portant dematerialisation de la commande publique',
          date: '15/01/2025',
          type: 'PDF',
        },
        {
          titre: 'Decret 2021-148 portant attributions, organisation et fonctionnement de l\'ARMP',
          date: '10/03/2021',
          type: 'PDF',
        },
        {
          titre: 'Decret 2020-571 portant modalites d\'application du Code des marches publics',
          date: '15/12/2020',
          type: 'PDF',
        },
      ],
    },
    {
      titre: 'Arretes ministeriels',
      documents: [
        {
          titre: 'Arrete portant seuils de passation des marches publics pour l\'exercice 2025',
          date: '20/01/2025',
          type: 'PDF',
        },
        {
          titre: 'Arrete portant documents types de passation des marches publics',
          date: '05/02/2021',
          type: 'PDF',
        },
      ],
    },
    {
      titre: 'Directives UEMOA',
      documents: [
        {
          titre: 'Directive n 04/2005/CM/UEMOA portant procedures de passation, d\'execution et de reglement des marches publics',
          date: '09/12/2005',
          type: 'PDF',
        },
        {
          titre: 'Directive n 05/2005/CM/UEMOA portant controle et regulation des marches publics',
          date: '09/12/2005',
          type: 'PDF',
        },
      ],
    },
    {
      titre: 'Guides et manuels',
      documents: [
        {
          titre: 'Guide pratique de la commande publique dematerialisee',
          date: '01/02/2025',
          type: 'PDF',
        },
        {
          titre: 'Manuel d\'utilisation de la plateforme e-Procurement pour les autorites contractantes',
          date: '01/02/2025',
          type: 'PDF',
        },
        {
          titre: 'Manuel d\'utilisation de la plateforme e-Procurement pour les soumissionnaires',
          date: '01/02/2025',
          type: 'PDF',
        },
      ],
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Textes reglementaires
        </h1>
        <p className="text-gray-600">
          Retrouvez l'ensemble des textes legislatifs, reglementaires et normatifs
          encadrant la commande publique en Republique du Benin.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Rechercher un texte..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button className="px-4 py-2 text-sm bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors">
            Rechercher
          </button>
        </div>
      </div>

      {/* Document categories */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.titre}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {cat.titre}
            </h2>
            <div className="space-y-3">
              {cat.documents.map((doc) => (
                <div
                  key={doc.titre}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-red-700 text-xs font-bold">{doc.type}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug">
                        {doc.titre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Publie le {doc.date}
                      </p>
                    </div>
                  </div>
                  <button className="flex-shrink-0 ml-4 px-3 py-1 text-xs font-medium text-green-700 border border-green-300 rounded hover:bg-green-50 transition-colors">
                    Telecharger
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
