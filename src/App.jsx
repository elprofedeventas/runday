import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './hooks/useUser'
import Onboarding from './pages/Onboarding'
import Hoy        from './pages/Hoy'
import Activo     from './pages/Activo'
import Historial  from './pages/Historial'
import Perfil     from './pages/Perfil'
import NavBar     from './components/NavBar'

export default function App() {
  const { user, hasCompletedOnboarding } = useUser()

  if (!hasCompletedOnboarding) {
    return (
      <div className="app-shell">
        <Routes>
          <Route path="*" element={<Onboarding />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/"          element={<Hoy />} />
        <Route path="/activo"    element={<Activo />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/perfil"    element={<Perfil />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
      <NavBar />
    </div>
  )
}
