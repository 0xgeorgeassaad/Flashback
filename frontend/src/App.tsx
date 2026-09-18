import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthenticatedProviders } from './components/auth/AuthenticatedProviders'
import { RequireAuth } from './components/auth/RequireAuth'
import { AuthPage } from './pages/AuthPage'
import { DiscoverPage } from './pages/DiscoverPage'
import { HomePage } from './pages/HomePage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'
import { MyListPage } from './pages/MyListPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ResultsPage } from './pages/ResultsPage'
import { TasteBuilderPage } from './pages/TasteBuilderPage'

export default function App() {
  return (
    <Routes>
      <Route path="auth" element={<AuthPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AuthenticatedProviders />}>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="taste" element={<TasteBuilderPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="my-list" element={<MyListPage />} />
            <Route path="movies/:movieId" element={<MovieDetailsPage />} />
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
