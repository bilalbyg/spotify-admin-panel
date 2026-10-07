import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { FormModal, FormField, inputClass } from "@/components/FormModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { getErrorMessage } from "@/lib/errors"
import {
  type Episode,
  type Podcast,
  getEpisodes,
  getPodcasts,
  createEpisode,
  updateEpisode,
  deleteEpisode,
} from "@/lib/api"

const emptyForm = {
  title: "",
  description: "",
  duration: 0,
  audioUrl: "",
  releaseDate: "",
  podcastId: "",
}

export default function Episodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [episodeToDelete, setEpisodeToDelete] = useState<Episode | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchEpisodes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEpisodes()
      setEpisodes(data)
    } catch (err) {
      setError(getErrorMessage(err, "Bölümler yüklenirken bir hata oluştu."))
      console.error("Bölümler çekilirken hata oluştu:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEpisodes()
    getPodcasts()
      .then(setPodcasts)
      .catch((err) => console.error("Podcastler çekilirken hata:", err))
  }, [])

  const podcastName = (podcastId: string) =>
    podcasts.find((p) => p.id === podcastId)?.title ?? podcastId

  const openCreateModal = () => {
    setEditingEpisode(null)
    setForm(emptyForm)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (episode: Episode) => {
    setEditingEpisode(episode)
    setForm({
      title: episode.title,
      description: episode.description ?? "",
      duration: episode.duration,
      audioUrl: episode.audioUrl ?? "",
      releaseDate: episode.releaseDate,
      podcastId: episode.podcastId,
    })
    setError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingEpisode) {
        await updateEpisode(editingEpisode.id, form)
      } else {
        await createEpisode(form)
      }
      await fetchEpisodes()
      setIsModalOpen(false)
      setEditingEpisode(null)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingEpisode
            ? "Bölüm güncellenirken bir hata oluştu."
            : "Bölüm eklenirken bir hata oluştu."
        )
      )
      console.error("Bölüm kaydedilirken hata oluştu:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!episodeToDelete) return
    setIsDeleting(true)
    try {
      await deleteEpisode(episodeToDelete.id)
      await fetchEpisodes()
      setEpisodeToDelete(null)
    } catch (err) {
      setError(getErrorMessage(err, "Bölüm silinirken bir hata oluştu."))
      console.error("Bölüm silinirken hata oluştu:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Episode>[] = [
    { accessorKey: "title", header: "Bölüm Adı" },
    {
      accessorKey: "podcastId",
      header: "Podcast",
      cell: ({ row }) => podcastName(row.getValue<string>("podcastId")),
    },
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
    { accessorKey: "releaseDate", header: "Yayın Tarihi" },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }) => {
        const episode = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => openEditModal(episode)}
              aria-label="Düzenle"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setEpisodeToDelete(episode)}
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
            Katalogdaki Bölümler ({episodes.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Tüm podcast bölümlerini görüntüle, ekle, düzenle veya sil
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Yeni Bölüm Ekle
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
            Bölümler yükleniyor...
          </p>
        ) : (
          <DataTable columns={columns} data={episodes} />
        )}
      </div>

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingEpisode ? "Bölüm Düzenle" : "Yeni Bölüm Ekle"}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={editingEpisode ? "Kaydet" : "Ekle"}
      >
        <FormField label="Bölüm Adı">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField label="Podcast">
          <select
            required
            value={form.podcastId}
            onChange={(e) => setForm({ ...form, podcastId: e.target.value })}
            className={inputClass}
          >
            <option value="">Podcast seçin</option>
            {podcasts.map((podcast) => (
              <option key={podcast.id} value={podcast.id}>
                {podcast.title}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Açıklama">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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

        <FormField label="Ses Dosyası URL">
          <input
            type="text"
            required
            value={form.audioUrl}
            onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField label="Yayın Tarihi">
          <input
            type="date"
            required
            value={form.releaseDate}
            onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
            className={inputClass}
          />
        </FormField>
      </FormModal>

      <DeleteConfirmDialog
        open={episodeToDelete !== null}
        onOpenChange={(open) => !open && setEpisodeToDelete(null)}
        itemName={episodeToDelete?.title ?? ""}
        entityLabel="Bölüm"
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
