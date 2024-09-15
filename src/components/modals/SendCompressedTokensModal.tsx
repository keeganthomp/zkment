import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import SendTokensForm from "../forms/SendTokensForm";
  
  type Props = {
    mint?: string | null;
    open: boolean;
    onClose: () => void;
  };
  
  export function SendCompressedTokensModal({ open, onClose, mint }: Props) {
    return (
      <Dialog modal open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send</DialogTitle>
            <p className="text-sm text-gray-400">{mint}</p>
            {mint && <SendTokensForm mint={mint} onSubmit={onClose} />}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  