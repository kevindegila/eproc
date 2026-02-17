import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@eproc/api-client'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AvisPage from './pages/AvisPage'
import PlansPage from './pages/PlansPage'
import PlanDetailPublicPage from './pages/PlanDetailPublicPage'
import TextesPage from './pages/TextesPage'
import ListeRougePage from './pages/ListeRougePage'
import DenonciationPage from './pages/DenonciationPage'
import ConnexionPage from './pages/ConnexionPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/avis" element={<AvisPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/plans/:planId" element={<PlanDetailPublicPage />} />
              <Route path="/textes" element={<TextesPage />} />
              <Route path="/liste-rouge" element={<ListeRougePage />} />
              <Route path="/denonciation" element={<DenonciationPage />} />
              <Route path="/connexion" element={<ConnexionPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
