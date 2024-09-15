import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReclaimForm from "../forms/ReclaimForm";
import { TokenAccount } from "@/utils/solana";

type Props = {
  tokenAccount?: TokenAccount | null;
  open: boolean;
  onClose: () => void;
};

export function ReclaimModal({ open, onClose, tokenAccount }: Props) {

  return (
    <Dialog modal open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reclaim</DialogTitle>
          <p className="text-sm text-gray-400">{tokenAccount?.mint}</p>
          {tokenAccount && (
            <ReclaimForm tokenAccount={tokenAccount} onSubmit={onClose} />
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
