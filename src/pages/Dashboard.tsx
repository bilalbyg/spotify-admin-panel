import { useEffect, useState } from "react"
import { Music, Mic2, Disc3, Users, ListMusic, Podcast } from "lucide-react"
import {
  getSongsCount,
  getArtistsCount,
  getAlbumsCount,
  getUsersCount,
  getPlaylistsCount,
  getPodcastsCount,
} from "@/lib/api"

interface DashboardStat {
  key: string
  label: string
  value: number | null
  icon: React.ElementType
  color: string
}

const statLoaders: {
  key: string
  label: string
  icon: React.ElementType
  color: string
  loader: () => Promise<number>
}[] = [
  {
    key: "songs",
    label: "Toplam Şarkı",
    icon: Music,
    color: "text-green-500",
    loader: getSongsCount,
  },
  {
    key: "artists",
    label: "Sanatçılar",
    icon: Mic2,
    color: "text-blue-500",
    loader: getArtistsCount,
  },
  {
    key: "albums",
    label: "Albümler",
    icon: Disc3,
    color: "text-purple-500",
    loader: getAlbumsCount,
  },
  {
    key: "users",
    label: "Kullanıcılar",
    icon: Users,
    color: "text-yellow-500",
    loader: getUsersCount,
  },
  {
    key: "playlists",
    label: "Playlistler",
    icon: ListMusic,
    color: "text-pink-500",
    loader: getPlaylistsCount,
  },
  {
    key: "podcasts",
    label: "Podcastler",
    icon: Podcast,
    color: "text-orange-500",
    loader: getPodcastsCount,
  },
]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStat[]>(
    statLoaders.map((s) => ({ ...s, value: null }))
  )
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true)
      setErrors({})

      const results = await Promise.allSettled(
        statLoaders.map(async (stat) => ({
          key: stat.key,
          value: await stat.loader(),
        }))
      )

      const nextStats: DashboardStat[] = []
      const nextErrors: Record<string, string> = {}

      results.forEach((result, index) => {
        const base = statLoaders[index]
        if (result.status === "fulfilled") {
          nextStats.push({ ...base, value: result.value.value })
        } else {
          nextStats.push({ ...base, value: null })
          const reason = result.reason
          let message = "Yüklenemedi"
          if (reason?.response?.status) {
            message = `HTTP ${reason.response.status}`
          } else if (reason?.message) {
            message = reason.message
          }
          nextErrors[base.key] = message
        }
      })

      setStats(nextStats)
      setErrors(nextErrors)
      setIsLoading(false)
    }

    loadStats()
  }, [])

  const formatValue = (value: number | null) => {
    if (value === null || isLoading) return "—"
    return value.toLocaleString("tr-TR")
  }

  const hasErrors = Object.keys(errors).length > 0

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
              <p className="text-2xl font-bold text-foreground">
                {formatValue(stat.value)}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {errors[stat.key] && (
                <p className="text-[10px] text-red-500 mt-1">
                  {errors[stat.key]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasErrors && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-500 space-y-1">
          <p className="font-semibold">Bazı istatistikler yüklenemedi:</p>
          <ul className="list-disc list-inside">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>
                {statLoaders.find((s) => s.key === key)?.label}: {message}
              </li>
            ))}
          </ul>
        </div>
      )}

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
