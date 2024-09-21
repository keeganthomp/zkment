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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCompressedTokens = useCallback(
    async (showLoading = true) => {
      if (!connectedWallet) {
        setError("Wallet not connected");
        return;
      }
      setIsFetching(showLoading);
      setError(null);
      try {
        const tokens = await fetCompressedTokenBalances(connectedWallet);
        setCompressedTokens(tokens);
        hasFetchedRef.current = true;
      } catch (err: any) {
        console.error("Error fetching compressed tokens:", err);
        setError(err?.message || "Unknown error");
      } finally {
        setIsFetching(false);
      }
    },
    [connectedWallet, setCompressedTokens]
  );

  useEffect(() => {
    // Function to start polling
    const startPolling = () => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Set up a new interval to fetch every 2.5 seconds
      intervalRef.current = setInterval(() => {
        fetchCompressedTokens(false);
      }, 2500);
    };

    if (connectedWallet) {
      if (!hasFetchedRef.current) {
        fetchCompressedTokens().then(() => {
          startPolling();
        });
      } else {
        startPolling();
      }
    }

    // Cleanup function to clear the interval when component unmounts or wallet changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [connectedWallet, fetchCompressedTokens]);

  return {
    compressedTokens,
    isFetching,
    error,
    refetch: fetchCompressedTokens,
  };
};
