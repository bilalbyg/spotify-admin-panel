import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2, Users } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { FormModal, FormField, inputClass } from "@/components/FormModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { BulkArtistForm } from "@/components/BulkArtistForm"
import { getErrorMessage } from "@/lib/errors"
import {
  type Artist,
  getArtists,
  createArtist,
  updateArtist,
  deleteArtist,
} from "@/lib/api"
import { createManyArtists } from "@/lib/batchArtists"

const emptyForm = { name: "", bio: "" }

export default function Artists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [batching, setBatching] = useState(false)
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false)

  const fetchArtists = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getArtists()
      setArtists(data)
    } catch (err) {
      setError(getErrorMessage(err, "Sanatçılar yüklenirken bir hata oluştu."))
      console.error("Sanatçılar çekilirken hata oluştu:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [])

  const openCreateModal = () => {
    setEditingArtist(null)
    setForm(emptyForm)
    setImageFile(null)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (artist: Artist) => {
    setEditingArtist(artist)
    setForm({ name: artist.name, bio: artist.bio ?? "" })
    setError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingArtist) {
        await updateArtist(editingArtist.id, form)
      } else {
        const formData = new FormData()
        formData.append("name", form.name)
        formData.append("bio", form.bio)
        if (imageFile) {
          formData.append("image", imageFile)
        }
        await createArtist(formData)
      }
      await fetchArtists()
      setIsModalOpen(false)
      setEditingArtist(null)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingArtist
            ? "Sanatçı güncellenirken bir hata oluştu."
            : "Sanatçı eklenirken bir hata oluştu."
        )
      )
      console.error("Sanatçı kaydedilirken hata oluştu:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!artistToDelete) return
    setIsDeleting(true)
    try {
      await deleteArtist(artistToDelete.id)
      await fetchArtists()
      setArtistToDelete(null)
    } catch (err) {
      setError(getErrorMessage(err, "Sanatçı silinirken bir hata oluştu."))
      console.error("Sanatçı silinirken hata oluştu:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBatchAdd = async (
    rows: { name: string; bio: string; image: File | null }[]
  ) => {
    if (rows.length === 0) return
    setBatching(true)
    setError(null)
    try {
      const { created, failed } = await createManyArtists(rows)
      if (failed.length > 0) {
        const firstError = failed[0].error
        const detail =
          typeof firstError === "string"
            ? firstError
            : firstError instanceof Error
              ? firstError.message
              : "Bilinmeyen hata"
        setError(`${failed.length} sanatçı eklenemedi: ${detail}`)
      } else {
        setIsBulkFormOpen(false)
      }
      if (created.length > 0) {
        await fetchArtists()
      }
    } catch (err) {
      setError(
        getErrorMessage(err, "Toplu sanatçı eklenirken bir hata oluştu.")
      )
      console.error("Toplu sanatçı eklenirken hata oluştu:", err)
    } finally {
      setBatching(false)
    }
  }

  const columns: ColumnDef<Artist>[] = [
    {
      accessorKey: "imageUrl",
      header: "Fotoğraf",
      cell: ({ row }) => {
        const url = row.getValue<string | null>("imageUrl")
        return url ? (
          <img
            src={url}
            alt={row.original.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-accent" />
        )
      },
    },
    { accessorKey: "name", header: "Sanatçı Adı" },
    {
      accessorKey: "bio",
      header: "Biyografi",
      cell: ({ row }) => {
        const bio = row.getValue<string | null>("bio")
        return bio && bio.length > 60 ? `${bio.slice(0, 60)}...` : bio
      },
    },
    { accessorKey: "popularity", header: "Popülerlik" },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }) => {
        const artist = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => openEditModal(artist)}
              aria-label="Düzenle"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setArtistToDelete(artist)}
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
            Katalogdaki Sanatçılar ({artists.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Tüm sanatçıları görüntüle, ekle, düzenle veya sil
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Yeni Sanatçı Ekle
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsBulkFormOpen(true)}
            disabled={batching}
          >
            <Users className="h-4 w-4" />
            Toplu Sanatçı Ekle
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
          Sanatçılar toplu olarak ekleniyor...
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        {loading ? (
          <p className="text-muted-foreground animate-pulse">
            Sanatçılar yükleniyor...
          </p>
        ) : (
          <DataTable columns={columns} data={artists} />
        )}
      </div>

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingArtist ? "Sanatçı Düzenle" : "Yeni Sanatçı Ekle"}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={editingArtist ? "Kaydet" : "Ekle"}
      >
        <FormField label="Sanatçı Adı">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField label="Biyografi">
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className={inputClass}
          />
        </FormField>

        {!editingArtist && (
          <FormField label="Fotoğraf (opsiyonel)">
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
        open={artistToDelete !== null}
        onOpenChange={(open) => !open && setArtistToDelete(null)}
        itemName={artistToDelete?.name ?? ""}
        entityLabel="Sanatçı"
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      <BulkArtistForm
        open={isBulkFormOpen}
        onOpenChange={setIsBulkFormOpen}
        onSubmit={handleBatchAdd}
        submitting={batching}
      />
    </div>
  )
}
