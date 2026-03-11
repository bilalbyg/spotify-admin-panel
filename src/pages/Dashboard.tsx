import { Music, Mic2, Disc3, Users, ListMusic, Podcast } from "lucide-react"

const stats = [
  { label: "Toplam Şarkı", value: "—", icon: Music, color: "text-green-500" },
  { label: "Sanatçılar", value: "—", icon: Mic2, color: "text-blue-500" },
  { label: "Albümler", value: "—", icon: Disc3, color: "text-purple-500" },
  { label: "Kullanıcılar", value: "—", icon: Users, color: "text-yellow-500" },
  { label: "Playlistler", value: "—", icon: ListMusic, color: "text-pink-500" },
  { label: "Podcastler", value: "—", icon: Podcast, color: "text-orange-500" },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-lg bg-accent ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Hızlı İşlemler
        </h3>
        <p className="text-sm text-muted-foreground">
          Sol menüdeki bağlantıları kullanarak içerik yönetimine
          erişebilirsiniz.
        </p>
      </div>
    </div>
  )
}
