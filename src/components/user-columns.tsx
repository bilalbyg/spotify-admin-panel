import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/api"

export interface UserColumnMeta {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export const userColumns = ({
  onEdit,
  onDelete,
}: UserColumnMeta): ColumnDef<User>[] => [
  {
    accessorKey: "username",
    header: "Kullanıcı Adı",
  },
  {
    accessorKey: "email",
    header: "E-posta",
  },
  {
    accessorKey: "role",
    header: "Rol",
  },
  {
    accessorKey: "subscriptionType",
    header: "Abonelik",
  },
  {
    accessorKey: "emailVerified",
    header: "Doğrulandı",
    cell: ({ row }) => (row.getValue("emailVerified") ? "Evet" : "Hayır"),
  },
  {
    id: "actions",
    header: "İşlemler",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(user)}
            aria-label="Düzenle"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(user)}
            aria-label="Sil"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
