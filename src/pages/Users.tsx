import { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import axios from "axios"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { userColumns } from "@/components/user-columns"
import {
  type User,
  type CreateUserRequest,
  type UpdateUserRequest,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/api"

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    const backendMessage =
      data?.message ||
      data?.error ||
      data?.detail ||
      data?.title ||
      err.response?.statusText
    if (backendMessage) return backendMessage
    if (err.code === "ERR_NETWORK") {
      return "Backend'e ulaşılamıyor. Lütfen API Gateway'in (localhost:8084) çalıştığından emin olun."
    }
    return err.message || fallback
  }
  if (err instanceof Error) {
    return err.message
  }
  return fallback
}

const emptyCreateForm: CreateUserRequest = {
  username: "",
  email: "",
  password: "",
  dateOfBirth: "",
  gender: "PREFER_NOT_TO_SAY",
  role: "USER",
  subscriptionType: "FREE",
  emailVerified: false,
}

const emptyUpdateForm: UpdateUserRequest = {
  username: "",
  role: "USER",
  subscriptionType: "FREE",
  emailVerified: false,
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<CreateUserRequest>(emptyCreateForm)
  const [updateForm, setUpdateForm] =
    useState<UpdateUserRequest>(emptyUpdateForm)
  const [submitting, setSubmitting] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      setError(
        getErrorMessage(err, "Kullanıcılar yüklenirken bir hata oluştu.")
      )
      console.error("Kullanıcılar çekilirken hata oluştu:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const openCreateModal = () => {
    setEditingUser(null)
    setForm(emptyCreateForm)
    setError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setUpdateForm({
      username: user.username,
      role: user.role,
      subscriptionType: user.subscriptionType,
      emailVerified: user.emailVerified,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setError(null)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createUser(form)
      await fetchUsers()
      closeModal()
    } catch (err) {
      setError(getErrorMessage(err, "Kullanıcı eklenirken bir hata oluştu."))
      console.error("Kullanıcı eklenirken hata oluştu:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setSubmitting(true)
    try {
      await updateUser(editingUser.id, updateForm)
      await fetchUsers()
      closeModal()
    } catch (err) {
      setError(
        getErrorMessage(err, "Kullanıcı güncellenirken bir hata oluştu.")
      )
      console.error("Kullanıcı güncellenirken hata oluştu:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setUserToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      await deleteUser(userToDelete.id)
      await fetchUsers()
      closeDeleteDialog()
    } catch (err) {
      setError(getErrorMessage(err, "Kullanıcı silinirken bir hata oluştu."))
      console.error("Kullanıcı silinirken hata oluştu:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDelete = (user: User) => {
    openDeleteDialog(user)
  }

  const columns = userColumns({
    onEdit: openEditModal,
    onDelete: handleDelete,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">
            Sistemdeki Kullanıcılar ({users.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Tüm kullanıcıları görüntüle, ekle, düzenle veya sil
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Yeni Kullanıcı Ekle
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
            Kullanıcılar yükleniyor...
          </p>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-bold">
                {editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {editingUser ? (
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={updateForm.username}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, username: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <select
                    value={updateForm.role}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        role: e.target.value as UpdateUserRequest["role"],
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Abonelik</label>
                  <select
                    value={updateForm.subscriptionType}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        subscriptionType: e.target
                          .value as UpdateUserRequest["subscriptionType"],
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="FREE">FREE</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="emailVerified"
                    type="checkbox"
                    checked={updateForm.emailVerified}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        emailVerified: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <label
                    htmlFor="emailVerified"
                    className="text-sm font-medium"
                  >
                    E-posta doğrulandı
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">E-posta</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Şifre</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Doğum Tarihi</label>
                  <input
                    type="date"
                    required
                    value={form.dateOfBirth}
                    onChange={(e) =>
                      setForm({ ...form, dateOfBirth: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cinsiyet</label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gender: e.target.value as CreateUserRequest["gender"],
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="MAN">Erkek</option>
                    <option value="WOMAN">Kadın</option>
                    <option value="NON_BINARY">Non-binary</option>
                    <option value="SOMETHING_ELSE">Başka bir şey</option>
                    <option value="PREFER_NOT_TO_SAY">
                      Söylemek istemiyorum
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value as CreateUserRequest["role"],
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Abonelik</label>
                  <select
                    value={form.subscriptionType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subscriptionType: e.target
                          .value as CreateUserRequest["subscriptionType"],
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="FREE">FREE</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="emailVerifiedCreate"
                    type="checkbox"
                    checked={form.emailVerified}
                    onChange={(e) =>
                      setForm({ ...form, emailVerified: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <label
                    htmlFor="emailVerifiedCreate"
                    className="text-sm font-medium"
                  >
                    E-posta doğrulandı
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Ekleniyor..." : "Ekle"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogHeader>
          <DialogTitle>Kullanıcıyı Sil</DialogTitle>
          <DialogDescription>
            {userToDelete ? (
              <>
                <span className="font-semibold text-foreground">
                  {userToDelete.username}
                </span>{" "}
                kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri
                alınamaz.
              </>
            ) : (
              "Bu kullanıcıyı silmek istediğinize emin misiniz?"
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={closeDeleteDialog}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
