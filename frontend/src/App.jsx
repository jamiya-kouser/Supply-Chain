// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { VoiceProvider } from './context/VoiceContext'

import Navbar    from './components/layout/Navbar'
import Sidebar   from './components/layout/Sidebar'
import Footer    from './components/layout/Footer'
import VoiceAssistantButton from './components/voice/VoiceAssistantButton'
import VoiceAssistantPanel  from './components/voice/VoiceAssistantPanel'

import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import DashboardPage     from './pages/DashboardPage'
import DispatchDashboard from './pages/DispatchDashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

/* ── Protected layout wrapper ───────────────────────────────── */
const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center animate-pulse">
            <span className="text-white font-display font-bold text-sm">L</span>
          </div>
          <p className="text-xs text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-900">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
      <Footer />

      {/* Global voice UI */}
      <VoiceAssistantPanel />
      <VoiceAssistantButton />
    </div>
  )
}

/* ── Placeholder pages for routes not yet built ─────────────── */
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
    <div className="w-12 h-12 rounded-xl bg-surface-700 border border-surface-500 flex items-center justify-center">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="font-display font-bold text-lg text-gray-200">{title}</h2>
    <p className="text-sm text-gray-500 max-w-xs">
      This section will be connected to the FastAPI backend. Navigate to{' '}
      <strong className="text-brand-300">Dashboard</strong> or{' '}
      <strong className="text-brand-300">Dispatch</strong> to see live data.
    </p>
  </div>
)

/* ── Root app ────────────────────────────────────────────────── */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <VoiceProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"      element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />}   />

            {/* Protected */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard"  element={<DashboardPage />}     />
              <Route path="/dispatch"   element={<DispatchDashboard />} />
              <Route path="/shipments"  element={<Placeholder title="Shipments" />} />
              <Route path="/drivers"    element={<Placeholder title="Drivers"   />} />
              <Route path="/exceptions" element={<Placeholder title="Exceptions"/>} />
              <Route path="/map"        element={<Placeholder title="Live Map"  />} />
              <Route path="/analytics"  element={<Placeholder title="Analytics" />} />
              <Route path="/settings"   element={<Placeholder title="Settings"  />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </VoiceProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
