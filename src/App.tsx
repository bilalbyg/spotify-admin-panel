import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { columns, type Song } from "@/components/columns"
import { DataTable } from "@/components/data-table"
import { ModeToggle } from "@/components/mode-toggle"

function App() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get("http://localhost:9000/api/v1/catalog/songs")
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
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground p-8 gap-8">

      <div className="flex justify-between items-center max-w-5xl mx-auto w-full mt-10">
        <h1 className="text-3xl font-bold">Spotify Yönetim Paneli</h1>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button size="lg">Yeni Şarkı Ekle</Button>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Katalogdaki Şarkılar ({songs.length})
        </h2>

        {loading ? (
          <p className="text-muted-foreground animate-pulse">Şarkılar yükleniyor...</p>
        ) : (
          <DataTable columns={columns} data={songs} />
        )}
      </div>

    </div>
  )
}

export default App