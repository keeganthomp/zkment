import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { openExplorerUrl } from "@/utils/solana";

export function MintCreatedModal({
  isOpen,
  onClose,
  mintAddress,
}: {
  isOpen: boolean;
  onClose: () => void;
  mintAddress: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mint Created!</DialogTitle>
        </DialogHeader>
        <DialogDescription className="font-thin">
            <div>
          <p>Your mint has been successfully created and is now available.</p>
          </div>
          <div className="pt-5 text-gray-600 text-center">
            <p>Mint Address</p>
            <p className="cursor-pointer underline" onClick={() => openExplorerUrl(mintAddress)}>{mintAddress}</p>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
