import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, ProtectedRoute } from '@eproc/api-client'
import Layout from './components/Layout'
import ConnexionPage from './pages/ConnexionPage'
import DashboardPage from './pages/DashboardPage'
import ControlePage from './pages/ControlePage'
import ControleDetailPage from './pages/ControleDetailPage'
import RecoursPage from './pages/RecoursPage'
import RecoursDetailPage from './pages/RecoursDetailPage'
import ArbitragePage from './pages/ArbitragePage'
import ConciliationPage from './pages/ConciliationPage'
import DenonciationsPage from './pages/DenonciationsPage'
import AuditsPage from './pages/AuditsPage'
import ListeRougePage from './pages/ListeRougePage'
import StatistiquesPage from './pages/StatistiquesPage'
import ParametresPage from './pages/ParametresPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/connexion" element={<ConnexionPage />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/controle" element={<ControlePage />} />
              <Route path="/controle/:id" element={<ControleDetailPage />} />
              <Route path="/recours" element={<RecoursPage />} />
              <Route path="/recours/:id" element={<RecoursDetailPage />} />
              <Route path="/arbitrage" element={<ArbitragePage />} />
              <Route path="/conciliation" element={<ConciliationPage />} />
              <Route path="/denonciations" element={<DenonciationsPage />} />
              <Route path="/audits" element={<AuditsPage />} />
              <Route path="/liste-rouge" element={<ListeRougePage />} />
              <Route path="/statistiques" element={<StatistiquesPage />} />
              <Route path="/parametres" element={<ParametresPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
