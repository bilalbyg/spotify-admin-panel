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
import type { Album, Artist } from "@/lib/api"
import {
  formatAudioDuration,
  readAudioDurationInSeconds,
} from "@/lib/audioDuration"

export interface BulkSongFormRow {
  rowId: number
  title: string
  duration: number
  audioFile: File | null
  durationLoading: boolean
  durationError: string | null
}

interface BulkSongFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  artists: Artist[]
  albums: Album[]
  onSubmit: (albumId: string, rows: BulkSongFormRow[]) => void
  submitting: boolean
}

const MAX_ROWS = 10
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

function generateRandomTitle(): string {
  return `${pick(TITLE_PARTS)}${pick(TITLE_ENDINGS)}`
}

export function BulkSongForm({
  open,
  onOpenChange,
  artists,
  albums,
  onSubmit,
  submitting,
}: BulkSongFormProps) {
  const nextRowId = React.useRef(2)
  const durationRequestIds = React.useRef(new Map<number, number>())
  const createEmptyRow = (rowId: number): BulkSongFormRow => ({
    rowId,
    title: "",
    duration: 0,
    audioFile: null,
    durationLoading: false,
    durationError: null,
  })
  const [artistId, setArtistId] = React.useState("")
  const [albumId, setAlbumId] = React.useState("")
  const [rows, setRows] = React.useState<BulkSongFormRow[]>(() => [
    createEmptyRow(0),
    createEmptyRow(1),
  ])

  React.useEffect(() => {
    if (open) {
      setArtistId("")
      setAlbumId("")
      durationRequestIds.current.clear()
      setRows([
        createEmptyRow(nextRowId.current++),
        createEmptyRow(nextRowId.current++),
      ])
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
      const rowId = nextRowId.current++
      setRows((previous) => [...previous, createEmptyRow(rowId)])
    }
  }

  const removeRow = (index: number) => {
    const rowId = rows[index]?.rowId
    if (rowId !== undefined) {
      durationRequestIds.current.delete(rowId)
    }
    setRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index))
  }

  const randomizeRow = (index: number) => {
    setRows((previous) =>
      previous.map((row, rowIndex) =>
        rowIndex === index ? { ...row, title: generateRandomTitle() } : row
      )
    )
  }

  const randomizeAll = () => {
    setRows((previous) =>
      previous.map((row) => ({ ...row, title: generateRandomTitle() }))
    )
  }

  const handleAudioFileChange = async (rowId: number, file: File | null) => {
    const requestId = (durationRequestIds.current.get(rowId) ?? 0) + 1
    durationRequestIds.current.set(rowId, requestId)
    setRows((previous) =>
      previous.map((row) =>
        row.rowId === rowId
          ? {
              ...row,
              audioFile: file,
              duration: 0,
              durationLoading: file !== null,
              durationError: null,
            }
          : row
      )
    )

    if (!file) return

    try {
      const duration = await readAudioDurationInSeconds(file)
      if (durationRequestIds.current.get(rowId) === requestId) {
        setRows((previous) =>
          previous.map((row) =>
            row.rowId === rowId && row.audioFile === file
              ? { ...row, duration, durationLoading: false }
              : row
          )
        )
      }
    } catch {
      if (durationRequestIds.current.get(rowId) === requestId) {
        setRows((previous) =>
          previous.map((row) =>
            row.rowId === rowId
              ? {
                  ...row,
                  durationLoading: false,
                  durationError:
                    "Ses dosyasının süresi okunamadı. Lütfen MP3 dosyasını kontrol edin.",
                }
              : row
          )
        )
      }
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (
      !albumId ||
      rows.some(
        (row) =>
          !row.title.trim() ||
          !row.audioFile ||
          row.durationLoading ||
          row.duration <= 0
      )
    ) {
      return
    }
    onSubmit(albumId, rows)
  }

  const canAddMore = rows.length < MAX_ROWS
  const artistAlbums = albums.filter((album) => album.artistId === artistId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Toplu Şarkı Ekle</DialogTitle>
        <DialogDescription>
          Önce sanatçı ve albüm seçin. Aynı anda en fazla {MAX_ROWS} şarkı
          ekleyebilirsiniz. Her şarkı için bir ses dosyası gereklidir.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <FormField label="Sanatçı">
          <select
            required
            value={artistId}
            onChange={(event) => {
              setArtistId(event.target.value)
              setAlbumId("")
            }}
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

        <FormField label="Albüm">
          <select
            required
            value={albumId}
            onChange={(event) => setAlbumId(event.target.value)}
            className={inputClass}
            disabled={!artistId}
          >
            <option value="">
              {artistId ? "Albüm seçin" : "Önce sanatçı seçin"}
            </option>
            {artistAlbums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </FormField>

        <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
          {rows.map((row, index) => (
            <div
              key={row.rowId}
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

                {row.audioFile && !row.durationLoading && row.duration > 0 && (
                  <FormField label="Süre">
                    <p className="text-sm text-muted-foreground">
                      {formatAudioDuration(row.duration)}
                    </p>
                  </FormField>
                )}

                <FormField label="Ses Dosyası (zorunlu)">
                  <input
                    type="file"
                    required
                    accept="audio/*"
                    onChange={(event) =>
                      void handleAudioFileChange(
                        row.rowId,
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
                  {row.durationLoading && (
                    <p className="text-xs text-muted-foreground">
                      Ses dosyasının süresi okunuyor...
                    </p>
                  )}
                  {row.durationError && (
                    <p className="text-sm text-destructive">
                      {row.durationError}
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
