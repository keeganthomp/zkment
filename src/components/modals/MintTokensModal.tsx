import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MintTokensForm from "../forms/MintTokensForm";
import { Loader } from "@/components/ui/loader";
import { useMintInfo } from "@/hooks/useMintInfo";

type Props = {
  mint?: string | null;
  open: boolean;
  onClose: () => void;
};

export function MintTokensModal({ open, onClose, mint }: Props) {
  const { isFetchingMintInfo, errorFetchingMintInfo, mintInfo, isAuthority } =
    useMintInfo(mint);

  const handleClose = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog modal open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <DialogTitle>Mint</DialogTitle>
        <p className="text-sm text-gray-400">{mint}</p>
      </DialogHeader>
      <DialogContent className="sm:max-w-[500px]">
        {isFetchingMintInfo ? (
          <div className="flex flex-col justify-center items-center">
            <Loader className="w-5 h-5" />
            <p className="text-sm text-gray-400">Fetching mint info...</p>
          </div>
        ) : errorFetchingMintInfo ? (
          <div className="flex flex-col justify-center items-center">
            <p className="text-sm text-red-500">
              Error fetching mint info: {errorFetchingMintInfo}
            </p>
          </div>
        ) : mintInfo && !isAuthority ? (
          <div className="flex flex-col justify-center items-center">
            <p className="text-sm text-red-500">
              You are not the mint authority.
            </p>
          </div>
        ) : mintInfo && isAuthority ? (
          <MintTokensForm mint={mint as string} onSubmit={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
