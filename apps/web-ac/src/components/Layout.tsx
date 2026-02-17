import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@eproc/api-client'

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: '\u2616' },
  { to: '/planification', label: 'Planification', icon: '\u2637' },
  { to: '/dac', label: "Dossiers d'appel", icon: '\u2702' },
  { to: '/evaluations', label: 'Evaluations', icon: '\u2611' },
  { to: '/contrats', label: 'Contrats', icon: '\u270D' },
  { to: '/execution', label: 'Execution', icon: '\u2699' },
  { to: '/paiements', label: 'Paiements', icon: '\u2B24' },
  { to: '/messages', label: 'Messages', icon: '\u2709' },
  { to: '/workflow-editor', label: 'Workflows', icon: '\u2B82' },
]

const breadcrumbMap: Record<string, string> = {
  '/': 'Tableau de bord',
  '/planification': 'Planification',
  '/dac': "Dossiers d'appel",
  '/dac/nouveau': "Nouveau dossier d'appel",
  '/evaluations': 'Evaluations',
  '/contrats': 'Contrats',
  '/execution': 'Execution',
  '/paiements': 'Paiements',
  '/messages': 'Messages',
  '/workflow-editor': 'Editeur de workflows',
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const currentPath = location.pathname
  const breadcrumbLabel = breadcrumbMap[currentPath] || 'Page'

  const breadcrumbParts: { label: string; path: string }[] = [
    { label: 'Accueil', path: '/' },
  ]
  if (currentPath !== '/') {
    if (currentPath.startsWith('/dac/')) {
      breadcrumbParts.push({ label: "Dossiers d'appel", path: '/dac' })
    }
    breadcrumbParts.push({ label: breadcrumbLabel, path: currentPath })
  }

  const userFirstName = user?.firstName || ''
  const userLastName = user?.lastName || ''
  const userEmail = user?.email || ''
  const userFullName = `${userFirstName} ${userLastName}`.trim() || 'Utilisateur'
  const userInitials = `${userFirstName.charAt(0)}${userLastName.charAt(0)}`.toUpperCase() || 'U'
  const userShortName = `${userFirstName.charAt(0)}. ${userLastName}`.trim()

  const handleLogout = () => {
    logout()
    navigate('/connexion')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 min-w-64 bg-[#1e3a5f] text-white">
        {/* Logo / title area */}
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-wide">eProcurement Benin</h1>
          <p className="text-xs text-blue-200 mt-1">{user?.organization?.sigle || user?.organization?.name || 'Portail Autorite Contractante'}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/' || item.to === '/dac'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User area */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{userFullName}</p>
              <p className="text-xs text-blue-200 truncate">{userEmail}</p>
              {user?.organization?.name && (
                <p className="text-xs text-blue-300 truncate mt-0.5">{user.organization.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-blue-200 hover:text-white transition-colors px-1"
          >
            {'\u2190'} Deconnexion
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500">
            {breadcrumbParts.map((part, index) => (
              <span key={part.path} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-300">/</span>}
                {index === breadcrumbParts.length - 1 ? (
                  <span className="text-gray-900 font-medium">{part.label}</span>
                ) : (
                  <NavLink to={part.path} className="hover:text-gray-700 transition-colors">
                    {part.label}
                  </NavLink>
                )}
              </span>
            ))}
          </nav>

          {/* Right side: notifications + user */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowUserDropdown(false)
                }}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl">{'\uD83D\uDD14'}</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="py-2">
                    <div className="px-4 py-2 hover:bg-gray-50">
                      <p className="text-sm text-gray-700">Nouveau DAC soumis pour validation</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-50">
                      <p className="text-sm text-gray-700">Date limite d'appel d'offres approche</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 5 heures</p>
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-50">
                      <p className="text-sm text-gray-700">Contrat CN-2025-042 approuve</p>
                      <p className="text-xs text-gray-400 mt-1">Hier</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown)
                  setShowNotifications(false)
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold">
                  {userInitials}
                </div>
                <span className="text-sm font-medium text-gray-700">{userShortName}</span>
                <span className="text-xs text-gray-400">{'\u25BC'}</span>
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userFullName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                    {user?.organization?.name && (
                      <p className="text-xs text-gray-400 mt-0.5">{user.organization.name}</p>
                    )}
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mon profil
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Parametres
                    </button>
                  </div>
                  <div className="py-1 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Deconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
