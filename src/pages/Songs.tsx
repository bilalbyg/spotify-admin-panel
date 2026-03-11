import { useEffect, useState } from "react"
import axios from "axios"
import { columns, type Song } from "@/components/columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9000/api/v1/catalog/songs"
        )
        setSongs(response.data)
      } catch (error) {
        console.error("Şarkılar çekilirken hata oluştu:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSongs()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">
            Katalogdaki Şarkılar ({songs.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Tüm şarkıları görüntüle ve yönet
          </p>
        </div>
        <Button>Yeni Şarkı Ekle</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <p className="text-muted-foreground animate-pulse">
            Şarkılar yükleniyor...
          </p>
        ) : (
          <DataTable columns={columns} data={songs} />
        )}
      </div>
    </div>
  )
}
