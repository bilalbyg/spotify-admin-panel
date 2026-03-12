import { Routes, Route } from "react-router-dom"
import AuthLayout from "@/layouts/AuthLayout"
import DashboardLayout from "@/layouts/DashboardLayout"
import ProtectedRoute from "@/components/ProtectedRoute"
import Login from "@/pages/Login"
import SignUp from "@/pages/SignUp"
import Dashboard from "@/pages/Dashboard"
import Songs from "@/pages/Songs"
import Artists from "@/pages/Artists"
import Albums from "@/pages/Albums"
import Playlists from "@/pages/Playlists"
import Podcasts from "@/pages/Podcasts"
import Episodes from "@/pages/Episodes"
import UsersPage from "@/pages/Users"
import Settings from "@/pages/Settings"

function App() {
  return (
    <Routes>
      {/* Public routes — AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Protected routes — DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/podcasts" element={<Podcasts />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
