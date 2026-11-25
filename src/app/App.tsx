import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { DashboardPage } from '../pages/DashboardPage/DashboardPage'
import { RepoInputPage } from '../pages/RepoInputPage/RepoInputPage'
import { paths } from './paths'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<RepoInputPage />} />
        <Route path={paths.analysisPattern} element={<DashboardPage />} />
        <Route path="*" element={<Navigate to={paths.home} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
