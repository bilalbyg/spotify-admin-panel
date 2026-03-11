import { ListMusic } from "lucide-react"

export default function Playlists() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="p-4 rounded-full bg-accent">
        <ListMusic className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Playlist Yönetimi</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Bu sayfa henüz geliştirme aşamasında. Playlist ekleme, düzenleme ve
        silme işlemleri yakında kullanılabilir olacak.
      </p>
    </div>
  )
}
