import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  entityLabel: string
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  entityLabel,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{entityLabel} Sil</DialogTitle>
        <DialogDescription>
          <span className="font-semibold text-foreground">{itemName}</span>{" "}
          {entityLabel.toLowerCase()} kaydını silmek istediğinize emin misiniz?
          Bu işlem geri alınamaz.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-4 gap-2 sm:gap-2">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          İptal
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? "Siliniyor..." : "Sil"}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
