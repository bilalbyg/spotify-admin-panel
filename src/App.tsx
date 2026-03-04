import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import axios from "axios"

// Backend'den gelecek şarkı objesinin tipini tanımlıyoruz (TypeScript)
interface Song {
  id: string;
  title: string;
  artist: string;
  albumImageUrl: string;
  audioUrl: string;
}

function App() {
  // Şarkıları tutacağımız state
  const [songs, setSongs] = useState<Song[]>([])
  // Yüklenme durumunu tutacağımız state
  const [loading, setLoading] = useState<boolean>(true)

  // Sayfa ilk yüklendiğinde çalışacak hook
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        // Backend'e GET isteği atıyoruz (9000 portuna dikkat)
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
    <div className="flex flex-col min-h-screen w-full items-center bg-background text-foreground p-8 gap-8">
      
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Spotify Yönetim Paneli</h1>
        <Button size="lg">Yeni Şarkı Ekle (Yakında)</Button>
      </div>

      <div className="w-full max-w-2xl bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Katalogdaki Şarkılar ({songs.length})
        </h2>
        
        {loading ? (
          <p className="text-muted-foreground animate-pulse">Şarkılar yükleniyor...</p>
        ) : songs.length > 0 ? (
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm max-h-96">
            {JSON.stringify(songs, null, 2)}
          </pre>
        ) : (
          <p className="text-muted-foreground">Henüz hiç şarkı eklenmemiş.</p>
        )}
      </div>

    </div>
  )
}

export default App