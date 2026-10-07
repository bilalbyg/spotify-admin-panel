import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { FormModal, FormField, inputClass } from "@/components/FormModal"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { getErrorMessage } from "@/lib/errors"
import {
  type Playlist,
  type User,
  getPlaylists,
  getUsers,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "@/lib/api"

const emptyForm = {
  name: "",
  description: "",
  coverImageUrl: "",
  isPublic: true,
  ownerId: "",
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPlaylists = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPlaylists()
      setPlaylists(data)
    } catch (err) {
      setError(getErrorMessage(err, "Playlistler yüklenirken bir hata oluştu."))
      console.error("Playlistler çekilirken hata oluştu:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("Kullanıcılar çekilirken hata:", err))
  }, [])

  const ownerName = (ownerId: string) =>
    users.find((u) => u.id === ownerId)?.username ?? ownerId

  const openCreateModal = () => {
    setEditingPlaylist(null)
    setForm(emptyForm)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (playlist: Playlist) => {
    setEditingPlaylist(playlist)
    setForm({
      name: playlist.name,
      description: playlist.description ?? "",
      coverImageUrl: playlist.coverImageUrl ?? "",
      isPublic: playlist.isPublic,
      ownerId: playlist.ownerId,
    })
    setError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingPlaylist) {
        await updatePlaylist(editingPlaylist.id, form)
      } else {
        await createPlaylist(form)
      }
      await fetchPlaylists()
      setIsModalOpen(false)
      setEditingPlaylist(null)
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editingPlaylist
            ? "Playlist güncellenirken bir hata oluştu."
            : "Playlist eklenirken bir hata oluştu."
        )
      )
      console.error("Playlist kaydedilirken hata oluştu:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!playlistToDelete) return
    setIsDeleting(true)
    try {
      await deletePlaylist(playlistToDelete.id)
      await fetchPlaylists()
      setPlaylistToDelete(null)
    } catch (err) {
      setError(getErrorMessage(err, "Playlist silinirken bir hata oluştu."))
      console.error("Playlist silinirken hata oluştu:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Playlist>[] = [
    { accessorKey: "name", header: "Playlist Adı" },
    {
      accessorKey: "description",
      header: "Açıklama",
      cell: ({ row }) => {
        const desc = row.getValue<string | null>("description")
        return desc && desc.length > 60 ? `${desc.slice(0, 60)}...` : desc
      },
    },
    {
      accessorKey: "ownerId",
      header: "Sahibi",
      cell: ({ row }) => ownerName(row.getValue<string>("ownerId")),
    },
    {
      accessorKey: "isPublic",
      header: "Herkese Açık",
      cell: ({ row }) => (row.getValue<boolean>("isPublic") ? "Evet" : "Hayır"),
    },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }) => {
        const playlist = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => openEditModal(playlist)}
              aria-label="Düzenle"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setPlaylistToDelete(playlist)}
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
            Sistemdeki Playlistler ({playlists.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Tüm playlistleri görüntüle, ekle, düzenle veya sil
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Yeni Playlist Ekle
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
            Playlistler yükleniyor...
          </p>
        ) : (
          <DataTable columns={columns} data={playlists} />
        )}
      </div>

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingPlaylist ? "Playlist Düzenle" : "Yeni Playlist Ekle"}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={editingPlaylist ? "Kaydet" : "Ekle"}
      >
        <FormField label="Playlist Adı">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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

        <FormField label="Sahibi">
          <select
            required
            value={form.ownerId}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
            className={inputClass}
          >
            <option value="">Kullanıcı seçin</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </FormField>

        <div className="flex items-center gap-2">
          <input
            id="isPublic"
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="isPublic" className="text-sm font-medium">
            Herkese açık
          </label>
        </div>
      </FormModal>

      <DeleteConfirmDialog
        open={playlistToDelete !== null}
        onOpenChange={(open) => !open && setPlaylistToDelete(null)}
        itemName={playlistToDelete?.name ?? ""}
        entityLabel="Playlist"
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
