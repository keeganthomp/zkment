import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { openExplorerUrl } from "@/utils/solana";
import { Copy } from "lucide-react";

export function MintCreatedModal({
  isOpen,
  onClose,
  mintAddress,
}: {
  isOpen: boolean;
  onClose: () => void;
  mintAddress: string;
}) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mintAddress);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mint Created!</DialogTitle>
        </DialogHeader>
        <div className="font-thin text-sm">
          <div>
            <p>Your mint has been successfully created and is now available.</p>
          </div>
          <div className="pt-5 text-gray-600 text-center">
            <p className="font-semibold">Mint Address</p>
            <div className="flex items-center gap-1" onClick={copyToClipboard}>
              <p className="cursor-pointer">{mintAddress}</p>
              <Copy className="cursor-pointer" width={15} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
