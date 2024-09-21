import { useEffect, useRef, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { TokenAccount } from "@/utils/solana";
import { useTokens } from "@/context/tokensContexts";
import { fetchSplTokenAccounts } from "@/utils/solana";

type UseSplTokenAccountsHook = {
  splTokenAccounts: TokenAccount[];
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
};

export const useSplTokenAccounts = (): UseSplTokenAccountsHook => {
  const { publicKey: connectedWallet } = useWallet();
  const { splTokenAccounts, setSplTokenAccounts } = useTokens();
  const hasFetchedRef = useRef(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSplAccounts = useCallback(
    async (showLoading = true) => {
      if (!connectedWallet) {
        setError("Wallet not connected");
        return;
      }
      setIsFetching(showLoading);
      setError(null);
      try {
        const accounts = await fetchSplTokenAccounts(connectedWallet);
        setSplTokenAccounts(accounts);
        hasFetchedRef.current = true;
      } catch (err: any) {
        console.error("Error fetching SPL tokens:", err);
        setError(err?.message || "Unknown error");
      } finally {
        setIsFetching(false);
      }
    },
    [connectedWallet, setSplTokenAccounts]
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
        fetchSplAccounts(false);
      }, 2500);
    };

    if (connectedWallet) {
      if (!hasFetchedRef.current) {
        fetchSplAccounts().then(() => {
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
  }, [connectedWallet, fetchSplAccounts]);

  return {
    splTokenAccounts,
    isFetching,
    error,
    refetch: fetchSplAccounts,
  };
};
