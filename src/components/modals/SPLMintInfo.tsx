"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatAddress, formatAmount } from "@/utils/solana";
import { Loader } from "@/components/ui/loader";
import { getAddressExplorerUrl } from "@/utils/solana";
import { CompressedTokenInfo } from "@/context/zkCompressionContext";
import {
  getCompressedMintInfo,
  CompressedTokenDetails,
} from "@/utils/zkCompression";

type Props = {
  token?: CompressedTokenInfo | null;
  onClose: () => void;
};

const SPLMintInfoModal = ({ token, onClose }: Props) => {
  const { publicKey: connectedWallet } = useWallet();
  const [isFetching, setIsFetching] = useState(false);
  const [mintInfo, setMintInfo] = useState<CompressedTokenDetails | null>(null);

  useEffect(() => {
    const fetchCompressedMintInfo = async () => {
      if (token?.mint && connectedWallet) {
        console.log("getting mint info..");
        setIsFetching(true);
        try {
          const compressedMintInfo = await getCompressedMintInfo({
            mint: new PublicKey(token.mint),
          });
          setMintInfo(compressedMintInfo);
        } catch (error) {
          console.error(error);
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchCompressedMintInfo();
  }, [token?.mint, connectedWallet]);

  const isOwner =
    mintInfo?.token?.mintAuthority?.toBase58() === connectedWallet?.toBase58();

  return (
    <Dialog modal open={!!token} onOpenChange={onClose}>
      <DialogContent>
        {isFetching ? (
          <div className="flex flex-col gap-1 items-center justify-center h-full">
            <Loader className="w-6 h-6 text-gray-600" />
            <p className="text-gray-500 text-xs">Fetching Mint Info...</p>
          </div>
        ) : (
          <>
            <DialogHeader className="pt-[18px]">
              <DialogTitle>SPL Mint Info</DialogTitle>
              <DialogDescription>
                <a
                  className="hover:underline"
                  href={getAddressExplorerUrl(mintInfo?.token?.mint.toBase58())}
                  target="_blank"
                >
                  {mintInfo?.token?.mint.toBase58()}
                </a>
              </DialogDescription>
            </DialogHeader>
            <div>
              <div className="text-sm text-gray-500 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900">Authority:</p>
                  <p>
                    {isOwner
                      ? "You"
                      : formatAddress(
                          mintInfo?.token?.mintAuthority?.toBase58() || ""
                        )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900">Balance:</p>
                  <p>
                    {formatAmount(token?.balance, mintInfo?.token?.decimals)}
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

export default SPLMintInfoModal;
