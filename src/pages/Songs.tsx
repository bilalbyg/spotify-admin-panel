import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { FormModal, FormField, inputClass } from "@/components/FormModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { getErrorMessage } from "@/lib/errors"
import {
  type Song,
  type Album,
  getSongs,
  getAlbums,
  createSong,
  updateSong,
  deleteSong,
} from "@/lib/api"

const emptyForm = { title: "", duration: 0, albumId: "" }

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [songToDelete, setSongToDelete] = useState<Song | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
  }, [])

  const openCreateModal = () => {
    setEditingSong(null)
    setForm(emptyForm)
    setAudioFile(null)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (song: Song) => {
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
    setSubmitting(true)
    try {
      if (editingSong) {
        await updateSong(editingSong.id, form)
      } else {
        if (!audioFile) {
          setError("Ses dosyası seçmek zorunludur.")
          setSubmitting(false)
          return
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
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Yeni Şarkı Ekle
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
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

        <FormField label="Süre (saniye)">
          <input
            type="number"
            required
            min={0}
            value={form.duration}
            onChange={(e) =>
              setForm({ ...form, duration: Number(e.target.value) })
            }
            className={inputClass}
          />
        </FormField>

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
              onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              className={inputClass}
            />
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
    </div>
  )
}
