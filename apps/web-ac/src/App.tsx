import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, ProtectedRoute } from '@eproc/api-client'
import Layout from './components/Layout'
import ConnexionPage from './pages/ConnexionPage'
import DashboardPage from './pages/DashboardPage'
import PlanificationPage from './pages/PlanificationPage'
import PlanDetailPage from './pages/PlanDetailPage'
import DACListPage from './pages/DACListPage'
import DACCreatePage from './pages/DACCreatePage'
import EvaluationsPage from './pages/EvaluationsPage'
import ContratsPage from './pages/ContratsPage'
import ExecutionPage from './pages/ExecutionPage'
import PaiementsPage from './pages/PaiementsPage'
import MessagesPage from './pages/MessagesPage'
import WorkflowListPage from './pages/workflow-editor/WorkflowListPage'
import WorkflowEditor from './pages/workflow-editor/WorkflowEditor'

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
              <Route path="/planification" element={<PlanificationPage />} />
              <Route path="/planification/:planId" element={<PlanDetailPage />} />
              <Route path="/dac" element={<DACListPage />} />
              <Route path="/dac/nouveau" element={<DACCreatePage />} />
              <Route path="/evaluations" element={<EvaluationsPage />} />
              <Route path="/contrats" element={<ContratsPage />} />
              <Route path="/execution" element={<ExecutionPage />} />
              <Route path="/paiements" element={<PaiementsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/workflow-editor" element={<WorkflowListPage />} />
              <Route path="/workflow-editor/:workflowId" element={<WorkflowEditor />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
