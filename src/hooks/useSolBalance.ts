import { useEffect, useRef, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useTokens } from "@/context/tokensContexts";
import { getSolBalance } from "@/utils/solana";

type UseSolBalanceHook = {
  solBalance: number;
  isFetching: boolean;
  error: string | null;
  refetch: () => void;
};

export const useSolBalance = (): UseSolBalanceHook => {
  const { publicKey: connectedWallet } = useWallet();
  const { connection } = useConnection();
  const { solBalance, setSolBalance } = useTokens();
  const hasFetchedRef = useRef(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletSolBalance = useCallback(async () => {
    if (!connectedWallet) {
      setError("Wallet not connected");
      return;
    }
    setIsFetching(true);
    setError(null);
    try {
      const solBalance = await getSolBalance(connection, connectedWallet);
      setSolBalance(solBalance);
      hasFetchedRef.current = true;
    } catch (err: any) {
      console.error("Error fetching SOL balance:", err);
      setError(err?.message || "Unknown error");
    } finally {
      setIsFetching(false);
    }
  }, [connectedWallet]);

  useEffect(() => {
    if (connectedWallet && !hasFetchedRef.current) {
      fetchWalletSolBalance();
    }
  }, [connectedWallet, fetchWalletSolBalance]);

  return {
    solBalance,
    isFetching,
    error,
    refetch: fetchWalletSolBalance,
  };
};
