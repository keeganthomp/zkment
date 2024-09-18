import { useEffect, useRef, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { CompressedTokenInfo } from "@/context/zkCompressionContext";
import { useTokens } from "@/context/tokensContexts";
import { fetCompressedTokenBalances } from "@/utils/zkCompression";

type UseCompressedTokenBalanceHook = {
  compressedTokens: CompressedTokenInfo[];
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
};

export const useCompressedTokenBalance = (): UseCompressedTokenBalanceHook => {
  const { publicKey: connectedWallet } = useWallet();
  const { compressedTokens, setCompressedTokens } = useTokens();
  const hasFetchedRef = useRef(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompressedTokens = useCallback(async () => {
    if (!connectedWallet) {
      setError("Wallet not connected");
      return;
    }
    setIsFetching(true);
    setError(null);
    try {
      const compressedTokens =
        await fetCompressedTokenBalances(connectedWallet);
      setCompressedTokens(compressedTokens);
      hasFetchedRef.current = true;
    } catch (err: any) {
      console.error("Error fetching compressed tokens:", err);
      setError(err?.message || "Unknown error");
    } finally {
      setIsFetching(false);
    }
  }, [connectedWallet]);

  useEffect(() => {
    if (connectedWallet && !hasFetchedRef.current) {
      fetchCompressedTokens();
    }
  }, [connectedWallet]);

  return {
    compressedTokens,
    isFetching,
    error,
    refetch: fetchCompressedTokens,
  };
};
