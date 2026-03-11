import { Radio } from "lucide-react"

export default function Episodes() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="p-4 rounded-full bg-accent">
        <Radio className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Bölüm Yönetimi</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Bu sayfa henüz geliştirme aşamasında. Podcast bölümü ekleme, düzenleme
        ve silme işlemleri yakında kullanılabilir olacak.
      </p>
    </div>
  )
}
