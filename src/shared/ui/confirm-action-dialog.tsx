import { ModalDialog } from "./modal-dialog";
import { Button } from "./button";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  isLoading,
}: ConfirmActionDialogProps) {
  return (
    <ModalDialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex justify-end gap-2.5 border-t border-border/60 pt-4">
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "default"}
          size="sm"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : confirmLabel}
        </Button>
      </div>
    </ModalDialog>
  );
}
