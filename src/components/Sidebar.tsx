import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Music,
  Mic2,
  Disc3,
  ListMusic,
  Podcast,
  Radio,
  Users,
  Settings,
} from "lucide-react"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/songs", label: "Şarkılar", icon: Music },
  { to: "/artists", label: "Sanatçılar", icon: Mic2 },
  { to: "/albums", label: "Albümler", icon: Disc3 },
  { to: "/playlists", label: "Playlistler", icon: ListMusic },
  { to: "/podcasts", label: "Podcastler", icon: Podcast },
  { to: "/episodes", label: "Bölümler", icon: Radio },
  { to: "/users", label: "Kullanıcılar", icon: Users },
  { to: "/settings", label: "Ayarlar", icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
          <Music className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground tracking-wide">
            Spotify Admin
          </h1>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
            Yönetim Paneli
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon
                className={`w-4 h-4 ${isActive ? "text-primary" : ""}`}
              />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center tracking-wide">
          © 2026 Spotify Admin Panel
        </p>
      </div>
    </aside>
  )
}
