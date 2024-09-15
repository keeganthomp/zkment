import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DecompressTokensForm from "../forms/DescompressTokenForm";

type Props = {
  mint?: string | null;
  open: boolean;
  onClose: () => void;
};

export function DecompressTokenModal({ open, onClose, mint }: Props) {
  return (
    <Dialog modal open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Decompress</DialogTitle>
          <p className="text-sm text-gray-400">{mint}</p>
          {mint && <DecompressTokensForm mint={mint} onSubmit={onClose} />}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
