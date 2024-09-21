import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAmount } from "@/utils/solana";
import { Loader } from "@/components/ui/loader";
import { getAddressExplorerUrl } from "@/utils/solana";
import { CompressedTokenInfo } from "@/context/zkCompressionContext";
import { useMintInfo } from "@/hooks/useMintInfo";

type Props = {
  open: boolean;
  onClose: () => void;
  token?: CompressedTokenInfo | null;
};

const CompressedMintInfoModal = ({ open, onClose, token }: Props) => {
  const { isFetchingMintInfo, errorFetchingMintInfo, mintInfo, isAuthority } =
    useMintInfo(token?.mint);

  return (
    <Dialog modal open={open} onOpenChange={onClose}>
      <DialogContent>
        {isFetchingMintInfo ? (
          <div className="flex flex-col gap-1 items-center justify-center h-full">
            <Loader className="w-6 h-6 text-gray-600" />
            <p className="text-gray-500 text-xs">Fetching Mint Info...</p>
          </div>
        ) : errorFetchingMintInfo ? (
          <div className="flex flex-col gap-1 items-center justify-center h-full">
            <p className="text-gray-500 text-xs">
              Error fetching mint info: {errorFetchingMintInfo}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="pt-[18px]">
              <DialogTitle>Compressed Mint Info</DialogTitle>
              <DialogDescription>
                <a
                  className="hover:underline"
                  href={getAddressExplorerUrl(mintInfo?.address?.toBase58())}
                  target="_blank"
                >
                  {mintInfo?.address?.toBase58()}
                </a>
              </DialogDescription>
            </DialogHeader>
            <div className="pt-3">
              <div className="text-sm text-gray-500 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                  <p className="text-gray-700">Decimals:</p>
                  <p>
                    {mintInfo?.decimals}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-700">Authority:</p>
                  <p>
                    {isAuthority
                      ? "You"
                      : mintInfo?.mintAuthority?.toBase58() || ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-700">Balance:</p>
                  <p>
                    {formatAmount(token?.balance, mintInfo?.decimals)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CompressedMintInfoModal;
