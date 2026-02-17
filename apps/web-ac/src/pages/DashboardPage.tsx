import { useDACs, useContracts, usePaymentRequests, LoadingSpinner } from '@eproc/api-client'

const recentActivity = [
  {
    time: 'Il y a 30 min',
    description: 'DAC-2025-0087 soumis pour validation par la DNCMP',
    type: 'info',
  },
  {
    time: 'Il y a 2h',
    description: "Evaluation des offres terminee pour le marche MR-2025-0034",
    type: 'success',
  },
  {
    time: 'Il y a 4h',
    description: "Nouveau plan de passation ajoute pour l'exercice 2025",
    type: 'info',
  },
  {
    time: 'Hier',
    description: 'Contrat CN-2025-042 signe et notifie au titulaire',
    type: 'success',
  },
  {
    time: 'Hier',
    description: "Ordre de service emis pour le marche d'entretien routier MR-2025-0012",
    type: 'info',
  },
  {
    time: '12 fev.',
    description: 'Paiement de 45M FCFA valide pour le decompte n 3',
    type: 'success',
  },
]

const alerts = [
  {
    severity: 'high',
    message: "Date limite de soumission dans 48h pour DAC-2025-0092",
  },
  {
    severity: 'high',
    message: "Delai de validite des offres expire le 20/02/2025 pour MR-2025-0028",
  },
  {
    severity: 'medium',
    message: "Plan de passation 2025 \u2014 3 lignes non encore lancees",
  },
  {
    severity: 'low',
    message: "Rapport d'execution trimestriel a soumettre avant le 28/02",
  },
]

export default function DashboardPage() {
  const { data: dacsData, isLoading: dacsLoading } = useDACs()
  const { data: contractsData, isLoading: contractsLoading } = useContracts()
  const { data: paymentsData, isLoading: paymentsLoading } = usePaymentRequests()

  const dacsCount = dacsData?.data?.length ?? dacsData?.meta?.total ?? 0
  const contractsCount = contractsData?.data?.length ?? contractsData?.meta?.total ?? 0
  const paymentsCount = paymentsData?.data?.length ?? paymentsData?.meta?.total ?? 0

  const pendingDacs = dacsData?.data?.filter(
    (d: Record<string, unknown>) => d.status === 'pending' || d.status === 'draft' || d.statut === 'En validation'
  )?.length ?? 0

  const stats = [
    {
      label: 'Marches en cours',
      value: dacsLoading ? '...' : String(dacsCount),
      change: `${pendingDacs} en attente`,
      changeType: 'up' as const,
      color: 'bg-blue-500',
      icon: '\u2636',
      loading: dacsLoading,
    },
    {
      label: 'DAC en attente',
      value: dacsLoading ? '...' : String(pendingDacs),
      change: pendingDacs > 0 ? `${pendingDacs} a traiter` : 'Aucun en attente',
      changeType: 'warning' as const,
      color: 'bg-amber-500',
      icon: '\u23F3',
      loading: dacsLoading,
    },
    {
      label: 'Contrats actifs',
      value: contractsLoading ? '...' : String(contractsCount),
      change: 'Total des contrats',
      changeType: 'up' as const,
      color: 'bg-emerald-500',
      icon: '\u270D',
      loading: contractsLoading,
    },
    {
      label: 'Paiements en instance',
      value: paymentsLoading ? '...' : String(paymentsCount),
      change: 'Demandes de paiement',
      changeType: 'neutral' as const,
      color: 'bg-purple-500',
      icon: '\u2B24',
      loading: paymentsLoading,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vue d'ensemble de vos activites de marches publics
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white text-lg`}
              >
                {stat.icon}
              </div>
            </div>
            {stat.loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                <p
                  className={`text-xs mt-2 ${
                    stat.changeType === 'up'
                      ? 'text-emerald-600'
                      : stat.changeType === 'warning'
                      ? 'text-amber-600'
                      : 'text-gray-500'
                  }`}
                >
                  {stat.change}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activite recente</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                      activity.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  />
                  {index < recentActivity.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm text-gray-700">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertes et rappels</h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : alert.severity === 'medium'
                    ? 'bg-amber-50 border-amber-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <p
                  className={`text-sm ${
                    alert.severity === 'high'
                      ? 'text-red-800'
                      : alert.severity === 'medium'
                      ? 'text-amber-800'
                      : 'text-blue-800'
                  }`}
                >
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
