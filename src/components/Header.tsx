import { useLocation, useNavigate } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/contexts/useAuth"
import { LogOut } from "lucide-react"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/songs": "Şarkı Yönetimi",
  "/artists": "Sanatçı Yönetimi",
  "/albums": "Albüm Yönetimi",
  "/playlists": "Playlist Yönetimi",
  "/podcasts": "Podcast Yönetimi",
  "/episodes": "Bölüm Yönetimi",
  "/users": "Kullanıcı Yönetimi",
  "/settings": "Ayarlar",
}

export default function Header() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const title = pageTitles[location.pathname] || "Spotify Admin Panel"

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-sm">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Spotify Clone Yönetim Paneli
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ModeToggle />
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">A</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {user?.email || "Admin"}
          </span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
