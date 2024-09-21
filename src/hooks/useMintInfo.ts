import { useState, useEffect, useCallback } from "react";
import { getMintInfo } from "@/utils/solana";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";

type MintInfoHook = {
  isFetchingMintInfo: boolean;
  errorFetchingMintInfo: string | null;
  mintInfo: any | null;
  isAuthority: boolean;
  clearMintInfo: () => void;
  refetch: () => void;
};

export const useMintInfo = (mint?: string | null): MintInfoHook => {
  const { publicKey: connectedWallet } = useWallet();
  const { connection } = useConnection();
  const [isFetchingMintInfo, setIsFetchingMintInfo] = useState(false);
  const [errorFetchingMintInfo, setErrorFetchingMintInfo] = useState<
    string | null
  >(null);
  const [mintInfo, setMintInfo] = useState<any>(null);
  const [isAuthority, setIsAuthority] = useState(false);

  const fetchMintInfo = useCallback(async () => {
    if (!mint || !connection || !connectedWallet) return;
    setIsFetchingMintInfo(true);
    setMintInfo(null);
    setIsAuthority(false);
    try {
      const mintInfo = await getMintInfo(connection, mint);
      setMintInfo(mintInfo);
      setIsAuthority(
        mintInfo?.mintAuthority?.toBase58() === connectedWallet.toBase58()
      );
    } catch (error: any) {
      setErrorFetchingMintInfo(error?.message || "Unknown error");
    } finally {
      setIsFetchingMintInfo(false);
    }
  }, [mint, connection, connectedWallet]);

  useEffect(() => {
    if (mint && connectedWallet && connection) {
      fetchMintInfo();
    }
  }, [mint, connection, connectedWallet]);

  const clearMintInfo = () => {
    setMintInfo(null);
    setIsAuthority(false);
    setErrorFetchingMintInfo(null);
    setIsFetchingMintInfo(false);
  };

  return {
    isFetchingMintInfo,
    errorFetchingMintInfo,
    mintInfo,
    isAuthority,
    refetch: fetchMintInfo,
    clearMintInfo,
  };
};
