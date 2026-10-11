import { useEffect, useRef, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Music2, Pencil, Plus, Trash2 } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { FormModal, FormField, inputClass } from "@/components/FormModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { BulkSongForm, type BulkSongFormRow } from "@/components/BulkSongForm"
import { getErrorMessage } from "@/lib/errors"
import {
  type Song,
  type Album,
  type Artist,
  getSongs,
  getAlbums,
  getArtists,
  createSong,
  updateSong,
  deleteSong,
} from "@/lib/api"
import { createManySongs } from "@/lib/batchSongs"
import {
  formatAudioDuration,
  readAudioDurationInSeconds,
} from "@/lib/audioDuration"

const emptyForm = { title: "", duration: 0, albumId: "" }

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [readingAudioDuration, setReadingAudioDuration] = useState(false)
  const [audioDurationError, setAudioDurationError] = useState<string | null>(
    null
  )
  const audioDurationRequest = useRef(0)
  const [submitting, setSubmitting] = useState(false)
  const [songToDelete, setSongToDelete] = useState<Song | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [batching, setBatching] = useState(false)
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false)

  const fetchSongs = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSongs()
      setSongs(data)
    } catch (err) {
      setError(getErrorMessage(err, "Şarkılar yüklenirken bir hata oluştu."))
      console.error("Şarkılar çekilirken hata oluştu:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSongs()
    getAlbums()
      .then(setAlbums)
      .catch((err) => console.error("Albümler çekilirken hata:", err))
    getArtists()
      .then(setArtists)
      .catch((err) => console.error("Sanatçılar çekilirken hata:", err))
  }, [])

  const openCreateModal = () => {
    setEditingSong(null)
    setForm(emptyForm)
    setAudioFile(null)
    setReadingAudioDuration(false)
    setAudioDurationError(null)
    audioDurationRequest.current += 1
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (song: Song) => {
    audioDurationRequest.current += 1
    setAudioFile(null)
    setReadingAudioDuration(false)
    setAudioDurationError(null)
    setEditingSong(song)
    setForm({
      title: song.title,
      duration: song.duration,
      albumId: song.albumId,
    })
    setError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSong && !audioFile) {
      setError("Ses dosyası seçmek zorunludur.")
      return
    }
    if (!editingSong && (readingAudioDuration || form.duration <= 0)) {
      setError(
        audioDurationError ?? "Ses dosyasının süresi okunana kadar bekleyin."
      )
      return
    }

    setSubmitting(true)
    try {
      if (editingSong) {
        await updateSong(editingSong.id, form)
      } else {
        if (!audioFile) {
          throw new Error("Ses dosyası seçmek zorunludur.")
        }
        const formData = new FormData()
        formData.append("title", form.title)
        formData.append("duration", String(form.duration))
        formData.append("albumId", form.albumId)
        formData.append("audioFile", audioFile)
        await createSong(formData)
      }
      await fetchSongs()
      setIsModalOpen(false)
      setEditingSong(null)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingSong
            ? "Şarkı güncellenirken bir hata oluştu."
            : "Şarkı eklenirken bir hata oluştu."
        )
      )
      console.error("Şarkı kaydedilirken hata oluştu:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAudioFileChange = async (file: File | null) => {
    const requestId = ++audioDurationRequest.current
    setAudioFile(file)
    setError(null)
    setAudioDurationError(null)
    setForm((previous) => ({ ...previous, duration: 0 }))

    if (!file) {
      setReadingAudioDuration(false)
      return
    }

    setReadingAudioDuration(true)
    try {
      const duration = await readAudioDurationInSeconds(file)
      if (requestId === audioDurationRequest.current) {
        setForm((previous) => ({ ...previous, duration }))
      }
    } catch (err) {
      if (requestId === audioDurationRequest.current) {
        setAudioDurationError(
          getErrorMessage(
            err,
            "Ses dosyasının süresi okunamadı. Lütfen MP3 dosyasını kontrol edin."
          )
        )
      }
    } finally {
      if (requestId === audioDurationRequest.current) {
        setReadingAudioDuration(false)
      }
    }
  }

  const confirmDelete = async () => {
    if (!songToDelete) return
    setIsDeleting(true)
    try {
      await deleteSong(songToDelete.id)
      await fetchSongs()
      setSongToDelete(null)
    } catch (err) {
      setError(getErrorMessage(err, "Şarkı silinirken bir hata oluştu."))
      console.error("Şarkı silinirken hata oluştu:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBatchAdd = async (albumId: string, rows: BulkSongFormRow[]) => {
    if (rows.length === 0) return

    const songsWithAudio = rows.flatMap((row) =>
      row.audioFile && !row.durationLoading && row.duration > 0
        ? [
            {
              title: row.title,
              duration: row.duration,
              audioFile: row.audioFile,
            },
          ]
        : []
    )
    if (songsWithAudio.length !== rows.length) {
      setError(
        "Her şarkı için geçerli bir ses dosyası seçip süresinin okunmasını bekleyin."
      )
      return
    }

    setBatching(true)
    setError(null)
    try {
      const { created, failed } = await createManySongs(albumId, songsWithAudio)
      if (failed.length > 0) {
        setError(
          `${failed.length} şarkı eklenemedi: ${getErrorMessage(
            failed[0].error,
            "Toplu şarkı eklenirken bir hata oluştu."
          )}`
        )
      } else {
        setIsBulkFormOpen(false)
      }
      if (created.length > 0) {
        await fetchSongs()
      }
    } catch (err) {
      setError(getErrorMessage(err, "Toplu şarkı eklenirken bir hata oluştu."))
      console.error("Toplu şarkı eklenirken hata oluştu:", err)
    } finally {
      setBatching(false)
    }
  }

  const columns: ColumnDef<Song>[] = [
    { accessorKey: "title", header: "Şarkı Adı" },
    { accessorKey: "albumTitle", header: "Albüm" },
    {
      accessorKey: "duration",
      header: "Süre",
      cell: ({ row }) => {
        const total = row.getValue<number>("duration")
        const min = Math.floor(total / 60)
        const sec = total % 60
        return `${min}:${sec.toString().padStart(2, "0")}`
      },
    },
    {
      accessorKey: "audioUrl",
      header: "Ses Dosyası",
      cell: ({ row }) => (
        <a
          href={row.getValue<string>("audioUrl")}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline"
        >
          Dinle
        </a>
      ),
    },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }) => {
        const song = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => openEditModal(song)}
              aria-label="Düzenle"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setSongToDelete(song)}
              aria-label="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">
            Katalogdaki Şarkılar ({songs.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Tüm şarkıları görüntüle, ekle, düzenle veya sil
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Yeni Şarkı Ekle
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsBulkFormOpen(true)}
            disabled={batching || albums.length === 0}
          >
            <Music2 className="h-4 w-4" />
            Toplu Şarkı Ekle
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {batching && (
        <div className="text-sm text-muted-foreground">
          Şarkılar toplu olarak ekleniyor...
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <p className="text-muted-foreground animate-pulse">
            Şarkılar yükleniyor...
          </p>
        ) : (
          <DataTable columns={columns} data={songs} />
        )}
      </div>

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingSong ? "Şarkı Düzenle" : "Yeni Şarkı Ekle"}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={editingSong ? "Kaydet" : "Ekle"}
      >
        <FormField label="Şarkı Adı">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </FormField>

        {editingSong ? (
          <FormField label="Süre">
            <p className="text-sm text-muted-foreground">
              {formatAudioDuration(form.duration)}
            </p>
          </FormField>
        ) : (
          audioFile &&
          !readingAudioDuration &&
          form.duration > 0 && (
            <FormField label="Süre">
              <p className="text-sm text-muted-foreground">
                {formatAudioDuration(form.duration)}
              </p>
            </FormField>
          )
        )}

        <FormField label="Albüm">
          <select
            required
            value={form.albumId}
            onChange={(e) => setForm({ ...form, albumId: e.target.value })}
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

        {!editingSong && (
          <FormField label="Ses Dosyası">
            <input
              type="file"
              required
              accept="audio/*"
              onChange={(e) =>
                void handleAudioFileChange(e.target.files?.[0] ?? null)
              }
              className={inputClass}
            />
            {readingAudioDuration && (
              <p className="text-xs text-muted-foreground">
                Ses dosyasının süresi okunuyor...
              </p>
            )}
            {audioDurationError && (
              <p className="text-sm text-destructive">{audioDurationError}</p>
            )}
          </FormField>
        )}
      </FormModal>

      <DeleteConfirmDialog
        open={songToDelete !== null}
        onOpenChange={(open) => !open && setSongToDelete(null)}
        itemName={songToDelete?.title ?? ""}
        entityLabel="Şarkı"
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      <BulkSongForm
        open={isBulkFormOpen}
        onOpenChange={setIsBulkFormOpen}
        artists={artists}
        albums={albums}
        onSubmit={handleBatchAdd}
        submitting={batching}
      />
    </div>
  )
}
