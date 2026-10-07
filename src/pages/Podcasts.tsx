import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { FormModal, FormField, inputClass } from "@/components/FormModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { getErrorMessage } from "@/lib/errors"
import {
  type Podcast,
  getPodcasts,
  createPodcast,
  updatePodcast,
  deletePodcast,
} from "@/lib/api"

const emptyForm = {
  title: "",
  description: "",
  publisher: "",
  coverImageUrl: "",
}

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [podcastToDelete, setPodcastToDelete] = useState<Podcast | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPodcasts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPodcasts()
      setPodcasts(data)
    } catch (err) {
      setError(getErrorMessage(err, "Podcastler yüklenirken bir hata oluştu."))
      console.error("Podcastler çekilirken hata oluştu:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPodcasts()
  }, [])

  const openCreateModal = () => {
    setEditingPodcast(null)
    setForm(emptyForm)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (podcast: Podcast) => {
    setEditingPodcast(podcast)
    setForm({
      title: podcast.title,
      description: podcast.description ?? "",
      publisher: podcast.publisher ?? "",
      coverImageUrl: podcast.coverImageUrl ?? "",
    })
    setError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingPodcast) {
        await updatePodcast(editingPodcast.id, form)
      } else {
        await createPodcast(form)
      }
      await fetchPodcasts()
      setIsModalOpen(false)
      setEditingPodcast(null)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingPodcast
            ? "Podcast güncellenirken bir hata oluştu."
            : "Podcast eklenirken bir hata oluştu."
        )
      )
      console.error("Podcast kaydedilirken hata oluştu:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!podcastToDelete) return
    setIsDeleting(true)
    try {
      await deletePodcast(podcastToDelete.id)
      await fetchPodcasts()
      setPodcastToDelete(null)
    } catch (err) {
      setError(getErrorMessage(err, "Podcast silinirken bir hata oluştu."))
      console.error("Podcast silinirken hata oluştu:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Podcast>[] = [
    { accessorKey: "title", header: "Podcast Adı" },
    { accessorKey: "publisher", header: "Yayıncı" },
    {
      accessorKey: "description",
      header: "Açıklama",
      cell: ({ row }) => {
        const desc = row.getValue<string | null>("description")
        return desc && desc.length > 60 ? `${desc.slice(0, 60)}...` : desc
      },
    },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }) => {
        const podcast = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => openEditModal(podcast)}
              aria-label="Düzenle"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setPodcastToDelete(podcast)}
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
            Katalogdaki Podcastler ({podcasts.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Tüm podcastleri görüntüle, ekle, düzenle veya sil
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Yeni Podcast Ekle
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
            Podcastler yükleniyor...
          </p>
        ) : (
          <DataTable columns={columns} data={podcasts} />
        )}
      </div>

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingPodcast ? "Podcast Düzenle" : "Yeni Podcast Ekle"}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={editingPodcast ? "Kaydet" : "Ekle"}
      >
        <FormField label="Podcast Adı">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField label="Yayıncı">
          <input
            type="text"
            required
            value={form.publisher}
            onChange={(e) => setForm({ ...form, publisher: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField label="Açıklama">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField label="Kapak Görseli URL (opsiyonel)">
          <input
            type="text"
            value={form.coverImageUrl}
            onChange={(e) =>
              setForm({ ...form, coverImageUrl: e.target.value })
            }
            className={inputClass}
          />
        </FormField>
      </FormModal>

      <DeleteConfirmDialog
        open={podcastToDelete !== null}
        onOpenChange={(open) => !open && setPodcastToDelete(null)}
        itemName={podcastToDelete?.title ?? ""}
        entityLabel="Podcast"
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
