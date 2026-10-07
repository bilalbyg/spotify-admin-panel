import * as React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onSubmit: (e: React.FormEvent) => void
  submitting: boolean
  submitLabel: string
  children: React.ReactNode
}

export function FormModal({
  open,
  onOpenChange,
  title,
  onSubmit,
  submitting,
  submitLabel,
  children,
}: FormModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-bold">{title}</h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Kaydediliyor..." : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Form elemanları için ortak stiller
export const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"

export function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}
