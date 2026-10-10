import * as React from "react"
import { Dices, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { inputClass, FormField } from "@/components/FormModal"
import type { Artist } from "@/lib/api"

export interface BulkAlbumRow {
  title: string
  releaseYear: number
  image: File | null
}

interface BulkAlbumFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  artists: Artist[]
  onSubmit: (artistId: string, rows: BulkAlbumRow[]) => void
  submitting: boolean
}

const MAX_ROWS = 10
const emptyRow: BulkAlbumRow = {
  title: "",
  releaseYear: new Date().getFullYear(),
  image: null,
}

const ADJECTIVES = [
  "Neon",
  "Velvet",
  "Cosmic",
  "Lunar",
  "Solar",
  "Electric",
  "Crystal",
  "Midnight",
  "Golden",
  "Silver",
  "Wild",
  "Silent",
  "Fuzzy",
  "Turbo",
  "Lazy",
  "Bright",
  "Dark",
  "Smooth",
  "Rough",
  "Echoing",
]

const NOUNS = [
  "Echo",
  "Cascade",
  "Drifter",
  "Horizon",
  "Bloom",
  "Falls",
  "Veil",
  "Tide",
  "Chamber",
  "Wildflower",
  "Wave",
  "Comet",
  "Shadow",
  "Flame",
  "Breeze",
  "Dream",
  "Rocket",
  "Whisper",
  "Storm",
  "Glitch",
  "Symphony",
  "Nocturne",
  "Serenade",
  "Odyssey",
]

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function generateAlbumTitle(): string {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`
}

function generateReleaseYear(): number {
  const currentYear = new Date().getFullYear()
  return Math.floor(Math.random() * (currentYear - 1980 + 1)) + 1980
}

function generateRandomRow(): BulkAlbumRow {
  return {
    title: generateAlbumTitle(),
    releaseYear: generateReleaseYear(),
    image: null,
  }
}

export function BulkAlbumForm({
  open,
  onOpenChange,
  artists,
  onSubmit,
  submitting,
}: BulkAlbumFormProps) {
  const [artistId, setArtistId] = React.useState("")
  const [rows, setRows] = React.useState<BulkAlbumRow[]>([
    { ...emptyRow },
    { ...emptyRow },
  ])

  React.useEffect(() => {
    if (open) {
      setArtistId("")
      setRows([{ ...emptyRow }, { ...emptyRow }])
    }
  }, [open])

  const handleChange = <K extends keyof BulkAlbumRow>(
    index: number,
    field: K,
    value: BulkAlbumRow[K]
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  const addRow = () => {
    if (rows.length < MAX_ROWS) {
      setRows((prev) => [...prev, { ...emptyRow }])
    }
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const randomizeRow = (index: number) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? generateRandomRow() : row))
    )
  }

  const randomizeAll = () => {
    setRows((prev) => prev.map(() => generateRandomRow()))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!artistId) return
    const validRows = rows.filter((row) => row.title.trim() !== "")
    if (validRows.length === 0) return
    onSubmit(artistId, validRows)
  }

  const canAddMore = rows.length < MAX_ROWS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Toplu Albüm Ekle</DialogTitle>
        <DialogDescription>
          Bir sanatçı seçip aynı anda en fazla {MAX_ROWS} albüm
          ekleyebilirsiniz.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <FormField label="Sanatçı">
          <select
            required
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            className={inputClass}
          >
            <option value="">Sanatçı seçin</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
          {rows.map((row, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Albüm #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => randomizeRow(index)}
                    aria-label="Rastgele doldur"
                    title="Rastgele doldur"
                  >
                    <Dices className="h-4 w-4" />
                  </Button>
                  {rows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(index)}
                      aria-label="Satırı sil"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <FormField label="Albüm Adı">
                  <input
                    type="text"
                    required
                    value={row.title}
                    onChange={(e) =>
                      handleChange(index, "title", e.target.value)
                    }
                    placeholder="Örn. Neon Echo"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Çıkış Yılı">
                  <input
                    type="number"
                    required
                    min={1900}
                    max={2100}
                    value={row.releaseYear}
                    onChange={(e) =>
                      handleChange(index, "releaseYear", Number(e.target.value))
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Kapak Fotoğrafı (opsiyonel)">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleChange(index, "image", e.target.files?.[0] ?? null)
                    }
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            disabled={!canAddMore || submitting}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            {canAddMore ? "Albüm Ekle" : "En fazla 10 albüm"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={randomizeAll}
            disabled={submitting}
            className="flex-1"
          >
            <Dices className="mr-2 h-4 w-4" />
            Tümünü Rastgele Doldur
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            İptal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Ekleniyor..." : "Ekle"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
