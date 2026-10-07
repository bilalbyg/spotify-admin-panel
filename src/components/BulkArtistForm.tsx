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

export interface BulkArtistRow {
  name: string
  bio: string
  image: File | null
}

interface BulkArtistFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (rows: BulkArtistRow[]) => void
  submitting: boolean
}

const MAX_ROWS = 10
const emptyRow: BulkArtistRow = { name: "", bio: "", image: null }

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
]

const BIO_TEMPLATES = [
  "{adj} sesler ve {adj} ritimlerle tanınır.",
  "{adj} atmosferi ve {adj} melodileri bir araya getirir.",
  "{adj} bir ruh hali ve {adj} enerjiyle sahne alır.",
  "{adj} notaların {adj} yolculuğuna çıkarır.",
  "{adj} dokunuşlar ve {adj} vuruşlarla öne çıkar.",
  "{adj} bir dünya kurar, {adj} bir duygu bırakır.",
  "{adj} harmanları ve {adj} tınıları sever.",
  "{adj} bir başlangıç, {adj} bir son.",
]

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function generateArtistName(): string {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`
}

function generateBio(): string {
  const template = pick(BIO_TEMPLATES)
  let bio = template
  while (bio.includes("{adj}")) {
    bio = bio.replace("{adj}", pick(ADJECTIVES).toLowerCase())
  }
  return bio
}

function generateRandomRow(): BulkArtistRow {
  return {
    name: generateArtistName(),
    bio: generateBio(),
    image: null,
  }
}

export function BulkArtistForm({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: BulkArtistFormProps) {
  const [rows, setRows] = React.useState<BulkArtistRow[]>([
    { ...emptyRow },
    { ...emptyRow },
  ])

  React.useEffect(() => {
    if (open) {
      setRows([{ ...emptyRow }, { ...emptyRow }])
    }
  }, [open])

  const handleChange = <K extends keyof BulkArtistRow>(
    index: number,
    field: K,
    value: BulkArtistRow[K]
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
    const validRows = rows.filter((row) => row.name.trim() !== "")
    if (validRows.length === 0) return
    onSubmit(validRows)
  }

  const canAddMore = rows.length < MAX_ROWS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Toplu Sanatçı Ekle</DialogTitle>
        <DialogDescription>
          Aşağıdaki formdan aynı anda en fazla {MAX_ROWS} sanatçı
          ekleyebilirsiniz.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {rows.map((row, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Sanatçı #{index + 1}
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
                <FormField label="Sanatçı Adı">
                  <input
                    type="text"
                    required
                    value={row.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    placeholder="Örn. Luna Echo"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Biyografi">
                  <textarea
                    rows={2}
                    value={row.bio}
                    onChange={(e) => handleChange(index, "bio", e.target.value)}
                    placeholder="Kısa biyografi..."
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Fotoğraf (opsiyonel)">
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
            {canAddMore ? "Satır Ekle" : "En fazla 10 satır"}
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
