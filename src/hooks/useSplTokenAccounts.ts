import { useEffect, useRef, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {} from "@/context/zkCompressionContext";
import { useTokens } from "@/context/tokensContexts";
import { fetchSplTokenAccounts, TokenAccount } from "@/utils/solana";

type useSplTokenAccounts = {
  splTokenAccounts: TokenAccount[];
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
};

export const useSplTokenAccounts = (): useSplTokenAccounts => {
  const { publicKey: connectedWallet } = useWallet();
  const { splTokenAccounts, setSplTokenAccounts } = useTokens();
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
      const compressedTokens = await fetchSplTokenAccounts(connectedWallet);
      setSplTokenAccounts(compressedTokens);
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
  }, [connectedWallet, fetchCompressedTokens]);

  return {
    splTokenAccounts,
    isFetching,
    error,
    refetch: fetchCompressedTokens,
  };
};
