import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  description,
  isPending = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex sm:justify-center gap-3 pt-6 border-t border-slate-100 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 size={16} />
                Delete
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
