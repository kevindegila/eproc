import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@eproc/api-client'

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'px-4 py-2 text-sm font-semibold text-white bg-green-800 rounded'
      : 'px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-800 hover:bg-green-50 rounded transition-colors'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* National colors stripe */}
      <div className="flex h-2">
        <div className="flex-1 bg-green-600"></div>
        <div className="flex-1 bg-yellow-400"></div>
        <div className="flex-1 bg-red-600"></div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 no-underline">
              <img
                src="/logo-portail-marche.png"
                alt="Logo Portail des Marches Publics"
                className="flex-shrink-0 h-14 w-auto"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  REPUBLIQUE DU BENIN
                </h1>
                <p className="text-sm text-green-800 font-medium">
                  Plateforme e-Procurement
                </p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                  >
                    Se deconnecter
                  </button>
                </div>
              ) : (
                <Link
                  to="/connexion"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded transition-colors no-underline"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
            <NavLink to="/" end className={navLinkClass}>
              Accueil
            </NavLink>
            <NavLink to="/avis" className={navLinkClass}>
              Avis d'appels
            </NavLink>
            <NavLink to="/plans" className={navLinkClass}>
              Plans previsionnels
            </NavLink>
            <NavLink to="/textes" className={navLinkClass}>
              Textes reglementaires
            </NavLink>
            <NavLink to="/liste-rouge" className={navLinkClass}>
              Liste rouge
            </NavLink>
            <NavLink to="/denonciation" className={navLinkClass}>
              Denonciation
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">
                A propos
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                La plateforme e-Procurement est la
                plateforme officielle de dematerialisation des marches publics en
                Republique du Benin, conformement au Decret 2025-169.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">
                Liens utiles
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/textes" className="hover:text-white transition-colors no-underline text-gray-400">
                    Textes reglementaires
                  </Link>
                </li>
                <li>
                  <Link to="/avis" className="hover:text-white transition-colors no-underline text-gray-400">
                    Avis d'appels a concurrence
                  </Link>
                </li>
                <li>
                  <Link to="/denonciation" className="hover:text-white transition-colors no-underline text-gray-400">
                    Signaler une irregularite
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-3">
                Contact
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Direction Nationale du Controle des Marches Publics (DNCMP)
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Autorite de Regulation des Marches Publics (ARMP)
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
              <p className="text-sm text-gray-400">
                Ministere de l'Economie et des Finances &mdash; Ministere du Numerique et de la Digitalisation
              </p>
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} Republique du Benin. Tous droits reserves.
              </p>
            </div>
          </div>
        </div>
        {/* National colors stripe at bottom */}
        <div className="flex h-1">
          <div className="flex-1 bg-green-600"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-red-600"></div>
        </div>
      </footer>
    </div>
  )
}
