import * as React from "react"
import { Dices, Music2, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FormField, inputClass } from "@/components/FormModal"
import type { Album } from "@/lib/api"

export interface BulkSongFormRow {
  title: string
  duration: number
  audioFile: File | null
}

interface BulkSongFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  albums: Album[]
  onSubmit: (albumId: string, rows: BulkSongFormRow[]) => void
  submitting: boolean
}

const MAX_ROWS = 10
const emptyRow: BulkSongFormRow = {
  title: "",
  duration: 180,
  audioFile: null,
}

const TITLE_PARTS = [
  "Afterglow",
  "Blue Horizon",
  "City Lights",
  "Distant Voices",
  "Echoes",
  "Falling Stars",
  "Golden Hour",
  "Hidden Roads",
  "Into the Night",
  "Last Dance",
  "Midnight Drive",
  "Open Skies",
  "Paper Moon",
  "Quiet Storm",
  "Silver Lining",
  "Stay a Little",
  "Summer Rain",
  "Wild Hearts",
]

const TITLE_ENDINGS = ["", "", "", " (Acoustic)", " (Live)", " Part II"]

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function generateRandomDetails(): Pick<BulkSongFormRow, "title" | "duration"> {
  return {
    title: `${pick(TITLE_PARTS)}${pick(TITLE_ENDINGS)}`,
    duration: Math.floor(Math.random() * 241) + 90,
  }
}

export function BulkSongForm({
  open,
  onOpenChange,
  albums,
  onSubmit,
  submitting,
}: BulkSongFormProps) {
  const [albumId, setAlbumId] = React.useState("")
  const [rows, setRows] = React.useState<BulkSongFormRow[]>([
    { ...emptyRow },
    { ...emptyRow },
  ])

  React.useEffect(() => {
    if (open) {
      setAlbumId("")
      setRows([{ ...emptyRow }, { ...emptyRow }])
    }
  }, [open])

  const handleChange = <K extends keyof BulkSongFormRow>(
    index: number,
    field: K,
    value: BulkSongFormRow[K]
  ) => {
    setRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    )
  }

  const addRow = () => {
    if (rows.length < MAX_ROWS) {
      setRows((previous) => [...previous, { ...emptyRow }])
    }
  }

  const removeRow = (index: number) => {
    setRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index))
  }

  const randomizeRow = (index: number) => {
    setRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...generateRandomDetails() } : row
      )
    )
  }

  const randomizeAll = () => {
    setRows((previous) =>
      previous.map((row) => ({ ...row, ...generateRandomDetails() }))
    )
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!albumId || rows.some((row) => !row.title.trim() || !row.audioFile)) {
      return
    }
    onSubmit(albumId, rows)
  }

  const canAddMore = rows.length < MAX_ROWS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Toplu Şarkı Ekle</DialogTitle>
        <DialogDescription>
          Bir albüm seçip aynı anda en fazla {MAX_ROWS} şarkı ekleyebilirsiniz.
          Her şarkı için bir ses dosyası gereklidir.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <FormField label="Albüm">
          <select
            required
            value={albumId}
            onChange={(event) => setAlbumId(event.target.value)}
            className={inputClass}
          >
            <option value="">Albüm seçin</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title} — {album.artistName}
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
                  Şarkı #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => randomizeRow(index)}
                    aria-label="Rastgele doldur"
                    title="Rastgele doldur"
                    disabled={submitting}
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
                      disabled={submitting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <FormField label="Şarkı Adı">
                  <input
                    type="text"
                    required
                    value={row.title}
                    onChange={(event) =>
                      handleChange(index, "title", event.target.value)
                    }
                    placeholder="Örn. Midnight Drive"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Süre (saniye)">
                  <input
                    type="number"
                    required
                    min={0}
                    value={row.duration}
                    onChange={(event) =>
                      handleChange(
                        index,
                        "duration",
                        Number(event.target.value)
                      )
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Ses Dosyası (zorunlu)">
                  <input
                    type="file"
                    required
                    accept="audio/*"
                    onChange={(event) =>
                      handleChange(
                        index,
                        "audioFile",
                        event.target.files?.[0] ?? null
                      )
                    }
                    className={inputClass}
                  />
                  {row.audioFile && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Music2 className="h-3 w-3" />
                      {row.audioFile.name}
                    </p>
                  )}
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
            {canAddMore ? "Şarkı Ekle" : "En fazla 10 şarkı"}
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
