import { useState } from 'react'
import { useTemplates, useUsers, LoadingSpinner, QueryError } from '@eproc/api-client'

type Tab = 'dac' | 'sve' | 'users'

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dac')

  const { data: templatesData, isLoading: templatesLoading, error: templatesError, refetch: refetchTemplates } = useTemplates()
  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers()

  const allTemplates = (templatesData?.data || []) as Record<string, string | number>[]
  const dacTemplates = allTemplates.filter((t) => String(t.type || t.category || '').toLowerCase().includes('dac'))
  const sveTemplates = allTemplates.filter((t) => !String(t.type || t.category || '').toLowerCase().includes('dac'))
  const users = (usersData?.data || []) as Record<string, string | number>[]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dac', label: 'Modeles DAC' },
    { key: 'sve', label: 'Formulaires SVE' },
    { key: 'users', label: 'Utilisateurs' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Parametres</h1>
        <p className="text-sm text-gray-500 mt-1">Configuration du systeme, modeles et gestion des utilisateurs</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-red-900 text-red-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* DAC Templates */}
      {activeTab === 'dac' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Modeles de Dossier d'Appel a Concurrence</h2>
            <button className="text-sm font-medium px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors">
              Nouveau modele
            </button>
          </div>
          {templatesLoading ? (
            <LoadingSpinner message="Chargement des modeles..." />
          ) : templatesError ? (
            <QueryError message="Impossible de charger les modeles." onRetry={refetchTemplates} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                {dacTemplates.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom du modele</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Version</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Derniere modification</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dacTemplates.map((t) => (
                        <tr key={String(t.id)} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-sm font-medium text-gray-900">{String(t.nom || t.name || '-')}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{String(t.version || '-')}</span>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-500">{String(t.modifie || t.updatedAt || '-')}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                              String(t.status || t.statut || '') === 'Actif' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                              {String(t.status || t.statut || '-')}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Modifier
                              </button>
                              <button className="text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Telecharger
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-5 py-12 text-center text-sm text-gray-500">Aucun modele DAC trouve</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SVE Form Templates */}
      {activeTab === 'sve' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Modeles de formulaires SVE</h2>
            <button className="text-sm font-medium px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors">
              Nouveau formulaire
            </button>
          </div>
          {templatesLoading ? (
            <LoadingSpinner message="Chargement des formulaires..." />
          ) : templatesError ? (
            <QueryError message="Impossible de charger les formulaires." onRetry={refetchTemplates} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                {sveTemplates.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom du formulaire</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Version</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Derniere modification</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sveTemplates.map((t) => (
                        <tr key={String(t.id)} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-sm font-medium text-gray-900">{String(t.nom || t.name || '-')}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{String(t.version || '-')}</span>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-500">{String(t.modifie || t.updatedAt || '-')}</td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                              {String(t.status || t.statut || '-')}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Modifier
                              </button>
                              <button className="text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Apercu
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-5 py-12 text-center text-sm text-gray-500">Aucun formulaire SVE trouve</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Gestion des utilisateurs</h2>
            <button className="text-sm font-medium px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors">
              Ajouter un utilisateur
            </button>
          </div>
          {usersLoading ? (
            <LoadingSpinner message="Chargement des utilisateurs..." />
          ) : usersError ? (
            <QueryError message="Impossible de charger les utilisateurs." onRetry={refetchUsers} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                {users.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Derniere connexion</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u) => {
                        const nom = String(u.nom || u.name || u.firstName || '-')
                        const initials = nom.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                        return (
                          <tr key={String(u.id)} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-900 text-white flex items-center justify-center text-xs font-semibold">
                                  {initials}
                                </div>
                                <span className="text-sm font-medium text-gray-900">{nom}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-500">{String(u.email || '-')}</td>
                            <td className="px-5 py-3">
                              <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{String(u.role || u.roleName || '-')}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                                String(u.status || u.statut || '') === 'Actif' || String(u.status || u.statut || '') === 'active'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}>
                                {String(u.status || u.statut || '-')}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-500">{String(u.derniereConnexion || u.lastLogin || u.lastLoginAt || '-')}</td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button className="text-xs font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                  Modifier
                                </button>
                                <button className="text-xs font-medium px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                                  Desactiver
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-5 py-12 text-center text-sm text-gray-500">Aucun utilisateur trouve</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
