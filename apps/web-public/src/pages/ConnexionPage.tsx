export default function ConnexionPage() {
  const portals = [
    {
      titre: 'Autorite Contractante',
      description:
        'Acces reserve aux agents des autorites contractantes (ministeres, institutions, collectivites, etablissements publics).',
      actions: [
        'Publier des avis d\'appels a concurrence',
        'Gerer les procedures de passation',
        'Evaluer les offres',
        'Suivre l\'execution des marches',
      ],
      url: 'http://localhost:5202',
      couleur: 'green',
    },
    {
      titre: 'Soumissionnaire',
      description:
        'Acces pour les operateurs economiques (entreprises, fournisseurs, prestataires de services, consultants).',
      actions: [
        'Consulter les appels d\'offres',
        'Retirer les dossiers de consultation',
        'Soumettre des offres en ligne',
        'Suivre l\'etat des soumissions',
      ],
      url: 'http://localhost:5201',
      couleur: 'blue',
    },
    {
      titre: 'ARMP / DNCMP',
      description:
        'Acces reserve aux agents des organes de controle et de regulation des marches publics.',
      actions: [
        'Controler les procedures de passation',
        'Emettre des avis et autorisations',
        'Gerer les recours et litiges',
        'Produire des statistiques',
      ],
      url: 'http://localhost:5203',
      couleur: 'yellow',
    },
  ]

  const colorMap: Record<string, { bg: string; border: string; text: string; btn: string; btnHover: string; bullet: string }> = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      btn: 'bg-green-700',
      btnHover: 'hover:bg-green-800',
      bullet: 'text-green-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      btn: 'bg-blue-700',
      btnHover: 'hover:bg-blue-800',
      bullet: 'text-blue-600',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      btn: 'bg-yellow-600',
      btnHover: 'hover:bg-yellow-700',
      bullet: 'text-yellow-600',
    },
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion a la plateforme e-Procurement</h1>
        <p className="text-gray-600">
          Selectionnez votre profil pour acceder a l'espace qui vous correspond.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {portals.map((portal) => {
          const colors = colorMap[portal.couleur]
          return (
            <div
              key={portal.titre}
              className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-6 flex flex-col`}
            >
              <h2 className={`text-lg font-bold ${colors.text} mb-2`}>
                {portal.titre}
              </h2>
              <p className="text-sm text-gray-600 mb-4">{portal.description}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {portal.actions.map((action) => (
                  <li key={action} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className={`${colors.bullet} mt-0.5 font-bold`}>&bull;</span>
                    {action}
                  </li>
                ))}
              </ul>
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center px-4 py-2.5 text-white font-medium rounded-md ${colors.btn} ${colors.btnHover} transition-colors no-underline`}
              >
                Se connecter
              </a>
            </div>
          )
        })}
      </div>

      {/* Registration info */}
      <div className="mt-10 bg-white rounded-lg border border-gray-200 p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Vous n'avez pas encore de compte ?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Pour creer un compte soumissionnaire, vous devez disposer d'un numero
          d'identification fiscale unique (IFU) valide. L'inscription est gratuite et
          entierement dematerialisee.
        </p>
        <a
          href="http://localhost:5201/inscription"
            target="_blank"
            rel="noopener noreferrer"
          className="inline-block px-6 py-2.5 text-sm font-medium text-green-700 border-2 border-green-700 rounded-md hover:bg-green-50 transition-colors no-underline"
        >
          Creer un compte soumissionnaire
        </a>
      </div>

      {/* Help */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          En cas de difficulte, contactez le support technique :{' '}
          <span className="font-medium text-gray-700">support@eprocurement.bj</span>{' '}
          ou appelez le{' '}
          <span className="font-medium text-gray-700">+229 21 30 XX XX</span>
        </p>
      </div>
    </div>
  )
}
