import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@eproc/api-client'

const navSections = [
  {
    title: 'CONTROLE',
    items: [
      { to: '/controle', label: 'Controle a priori' },
    ],
  },
  {
    title: 'REGULATION',
    items: [
      { to: '/recours', label: 'Recours' },
      { to: '/arbitrage', label: 'Arbitrage' },
      { to: '/conciliation', label: 'Conciliation' },
      { to: '/denonciations', label: 'Denonciations' },
    ],
  },
  {
    title: 'SUPERVISION',
    items: [
      { to: '/audits', label: 'Audits' },
      { to: '/liste-rouge', label: 'Liste rouge' },
      { to: '/statistiques', label: 'Statistiques' },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { to: '/parametres', label: 'Parametres' },
    ],
  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const urgentNotifications = [
    { id: 1, message: 'DAC-2026-0142 : delai de transmission expire dans 6h (Art. 145)', urgent: true },
    { id: 2, message: 'Recours REC-2026-0089 : audience prevue demain 14h00', urgent: true },
    { id: 3, message: '3 DAC en attente de controle depuis plus de 48h', urgent: false },
    { id: 4, message: 'Nouvelle denonciation recue - priorite haute', urgent: true },
  ]

  const userInitials = user
    ? `${(user.firstName || '').charAt(0)}${(user.lastName || '').charAt(0)}`.toUpperCase() || '??'
    : '??'
  const userFullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur'
  const userEmail = user?.email || ''
  const userRoles = user?.roles?.join(', ') || 'Agent'

  const handleLogout = () => {
    logout()
    navigate('/connexion')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-[#7f1d1d] text-white flex flex-col shrink-0">
        {/* Logo / Title */}
        <div className="px-6 py-6 border-b border-red-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">eProcurement Benin</h1>
              <p className="text-xs text-red-300 font-medium tracking-wide">Portail Regulation</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Dashboard link */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-4 ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-red-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Tableau de bord
          </NavLink>

          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-red-400 uppercase">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white font-medium'
                        : 'text-red-200 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User area */}
        <div className="px-4 py-4 border-t border-red-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-800 flex items-center justify-center text-sm font-semibold">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userFullName}</p>
              <p className="text-xs text-red-300 truncate">{userRoles}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un dossier, un recours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900/30 focus:border-red-900"
              />
            </div>
          </div>

          {/* Right side: notifications + user */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false) }}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {urgentNotifications.filter(n => n.urgent).length}
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Alertes et notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {urgentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b border-gray-50 last:border-0 ${
                          notif.urgent ? 'bg-red-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {notif.urgent && (
                            <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-red-500" />
                          )}
                          <p className="text-sm text-gray-700">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button className="text-xs text-red-900 font-medium hover:underline">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-200" />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false) }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-900 text-white flex items-center justify-center text-xs font-semibold">
                  {userInitials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">{userFullName}</p>
                  <p className="text-xs text-gray-500">{userRoles}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userFullName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Mon profil
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Preferences
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Se deconnecter
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
