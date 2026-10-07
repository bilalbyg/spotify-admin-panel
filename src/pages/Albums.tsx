import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { FormModal, FormField, inputClass } from "@/components/FormModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { getErrorMessage } from "@/lib/errors"
import {
  type Album,
  type Artist,
  getAlbums,
  getArtists,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "@/lib/api"

const emptyForm = {
  title: "",
  releaseYear: new Date().getFullYear(),
  artistId: "",
}

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchAlbums = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAlbums()
      setAlbums(data)
    } catch (err) {
      setError(getErrorMessage(err, "Albümler yüklenirken bir hata oluştu."))
      console.error("Albümler çekilirken hata oluştu:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlbums()
    getArtists()
      .then(setArtists)
      .catch((err) => console.error("Sanatçılar çekilirken hata:", err))
  }, [])

  const openCreateModal = () => {
    setEditingAlbum(null)
    setForm(emptyForm)
    setImageFile(null)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (album: Album) => {
    setEditingAlbum(album)
    setForm({
      title: album.title,
      releaseYear: album.releaseYear,
      artistId: album.artistId,
    })
    setError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, form)
      } else {
        const formData = new FormData()
        formData.append("title", form.title)
        formData.append("releaseYear", String(form.releaseYear))
        formData.append("artistId", form.artistId)
        if (imageFile) {
          formData.append("image", imageFile)
        }
        await createAlbum(formData)
      }
      await fetchAlbums()
      setIsModalOpen(false)
      setEditingAlbum(null)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingAlbum
            ? "Albüm güncellenirken bir hata oluştu."
            : "Albüm eklenirken bir hata oluştu."
        )
      )
      console.error("Albüm kaydedilirken hata oluştu:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!albumToDelete) return
    setIsDeleting(true)
    try {
      await deleteAlbum(albumToDelete.id)
      await fetchAlbums()
      setAlbumToDelete(null)
    } catch (err) {
      setError(getErrorMessage(err, "Albüm silinirken bir hata oluştu."))
      console.error("Albüm silinirken hata oluştu:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Album>[] = [
    {
      accessorKey: "coverImageUrl",
      header: "Kapak",
      cell: ({ row }) => {
        const url = row.getValue<string | null>("coverImageUrl")
        return url ? (
          <img
            src={url}
            alt={row.original.title}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-accent" />
        )
      },
    },
    { accessorKey: "title", header: "Albüm Adı" },
    { accessorKey: "artistName", header: "Sanatçı" },
    { accessorKey: "releaseYear", header: "Çıkış Yılı" },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }) => {
        const album = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => openEditModal(album)}
              aria-label="Düzenle"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setAlbumToDelete(album)}
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
            Katalogdaki Albümler ({albums.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Tüm albümleri görüntüle, ekle, düzenle veya sil
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Yeni Albüm Ekle
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
            Albümler yükleniyor...
          </p>
        ) : (
          <DataTable columns={columns} data={albums} />
        )}
      </div>

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingAlbum ? "Albüm Düzenle" : "Yeni Albüm Ekle"}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={editingAlbum ? "Kaydet" : "Ekle"}
      >
        <FormField label="Albüm Adı">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField label="Çıkış Yılı">
          <input
            type="number"
            required
            min={1900}
            max={2100}
            value={form.releaseYear}
            onChange={(e) =>
              setForm({ ...form, releaseYear: Number(e.target.value) })
            }
            className={inputClass}
          />
        </FormField>

        <FormField label="Sanatçı">
          <select
            required
            value={form.artistId}
            onChange={(e) => setForm({ ...form, artistId: e.target.value })}
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

        {!editingAlbum && (
          <FormField label="Kapak Fotoğrafı (opsiyonel)">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className={inputClass}
            />
          </FormField>
        )}
      </FormModal>

      <DeleteConfirmDialog
        open={albumToDelete !== null}
        onOpenChange={(open) => !open && setAlbumToDelete(null)}
        itemName={albumToDelete?.title ?? ""}
        entityLabel="Albüm"
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
