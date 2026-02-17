import { Link } from 'react-router-dom'
import { useAuth, useDACs, useSubmissions, useContracts, LoadingSpinner, QueryError } from '@eproc/api-client'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: dacsData, isLoading: dacsLoading, error: dacsError, refetch: refetchDacs } = useDACs({ status: 'PUBLIE' })
  const { data: submissionsData, isLoading: subsLoading, error: subsError, refetch: refetchSubs } = useSubmissions()
  const { data: contractsData, isLoading: contractsLoading, error: contractsError, refetch: refetchContracts } = useContracts()

  const isLoading = dacsLoading || subsLoading || contractsLoading
  const hasError = dacsError || subsError || contractsError

  const dacs = dacsData?.data ?? []
  const submissions = submissionsData?.data ?? []
  const contracts = contractsData?.data ?? []

  const activeContracts = contracts.filter((c: Record<string, unknown>) => c.status === 'ACTIF' || c.status === 'EN_COURS')
  const pendingSubmissions = submissions.filter((s: Record<string, unknown>) => s.status === 'SOUMISE' || s.status === 'EN_EVALUATION')

  const userFullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur'

  const stats = [
    {
      label: 'Appels en cours',
      value: String(dacs.length),
      change: `${dacs.length} publie${dacs.length > 1 ? 's' : ''}`,
      changeType: 'positive' as const,
      href: '/appels',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Offres en attente',
      value: String(pendingSubmissions.length),
      change: `${submissions.length} total`,
      changeType: 'neutral' as const,
      href: '/mes-offres',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Contrats actifs',
      value: String(activeContracts.length),
      change: `${contracts.length} total`,
      changeType: 'positive' as const,
      href: '/contrats',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Soumissions',
      value: String(submissions.length),
      change: `${pendingSubmissions.length} en cours`,
      changeType: 'neutral' as const,
      href: '/mes-offres',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ]

  if (isLoading) {
    return <LoadingSpinner message="Chargement du tableau de bord..." />
  }

  if (hasError) {
    return (
      <QueryError
        message="Erreur lors du chargement du tableau de bord."
        onRetry={() => { refetchDacs(); refetchSubs(); refetchContracts() }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue, {userFullName}. Voici un apercu de votre activite.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-teal-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${stat.bgColor} ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
            <p className={`mt-3 text-xs font-medium ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
            }`}>
              {stat.change}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent submissions */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Soumissions recentes</h2>
            <Link to="/mes-offres" className="text-sm font-medium text-teal-600 hover:text-teal-700">Voir tout</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {submissions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">Aucune soumission pour le moment.</p>
                <Link to="/appels" className="mt-2 inline-block text-sm font-medium text-teal-600 hover:text-teal-700">
                  Parcourir les appels d'offres
                </Link>
              </div>
            ) : (
              submissions.slice(0, 5).map((submission: Record<string, unknown>) => (
                <div key={submission.id as string} className="flex gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="mt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50">
                      <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {(submission.reference as string) || `Soumission #${(submission.id as string).slice(0, 8)}`}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {(submission.objet as string) || (submission.dacId as string) || 'Soumission'}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {submission.createdAt ? new Date(submission.createdAt as string).toLocaleDateString('fr-FR') : ''}
                    </p>
                  </div>
                  <span className={`self-start shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    submission.status === 'RETENUE' ? 'bg-green-100 text-green-700' :
                    submission.status === 'REJETEE' ? 'bg-red-100 text-red-700' :
                    submission.status === 'EN_EVALUATION' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {(submission.status as string) || 'Soumise'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent DACs */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Appels recents</h2>
          </div>
          <div className="divide-y divide-gray-50 p-2">
            {dacs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">Aucun appel en cours.</p>
              </div>
            ) : (
              dacs.slice(0, 3).map((dac: Record<string, unknown>) => (
                <Link
                  key={dac.id as string}
                  to={`/appels/${dac.id}`}
                  className="block rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-mono font-medium text-teal-600">
                      {(dac.reference as string) || `DAC-${(dac.id as string).slice(0, 8)}`}
                    </span>
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                      {(dac.status as string) || 'Publie'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-gray-900 line-clamp-2">
                    {(dac.objet as string) || (dac.title as string) || 'Appel d\'offres'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {dac.dateLimite
                      ? `Date limite : ${new Date(dac.dateLimite as string).toLocaleDateString('fr-FR')}`
                      : dac.closingDate
                      ? `Date limite : ${new Date(dac.closingDate as string).toLocaleDateString('fr-FR')}`
                      : ''}
                  </p>
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-gray-100 px-6 py-3">
            <Link to="/appels" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              Voir tous les appels
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
