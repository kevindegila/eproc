import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, ProtectedRoute } from '@eproc/api-client'
import Layout from './components/Layout'
import ConnexionPage from './pages/ConnexionPage'
import DashboardPage from './pages/DashboardPage'
import AppelsPage from './pages/AppelsPage'
import AppelDetailPage from './pages/AppelDetailPage'
import MesOffresPage from './pages/MesOffresPage'
import SoumettreOffrePage from './pages/SoumettreOffrePage'
import ContratsPage from './pages/ContratsPage'
import PaiementsPage from './pages/PaiementsPage'
import RecoursPage from './pages/RecoursPage'
import MessagesPage from './pages/MessagesPage'
import ProfilPage from './pages/ProfilPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/connexion" element={<ConnexionPage />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/appels" element={<AppelsPage />} />
              <Route path="/appels/:id" element={<AppelDetailPage />} />
              <Route path="/mes-offres" element={<MesOffresPage />} />
              <Route path="/mes-offres/soumettre/:dacId" element={<SoumettreOffrePage />} />
              <Route path="/contrats" element={<ContratsPage />} />
              <Route path="/paiements" element={<PaiementsPage />} />
              <Route path="/recours" element={<RecoursPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profil" element={<ProfilPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
