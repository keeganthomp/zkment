import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { getTransactions } from "../utils/solana";

interface UseTransactionsResult {
  transactions: any[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTransactions = (
  publicKey: PublicKey | null
): UseTransactionsResult => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Define the fetch function using useCallback to memoize it
  const fetchTransactions = useCallback(() => {
    if (!publicKey) {
      // If there's no publicKey, reset the state
      setTransactions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    getTransactions(publicKey)
      .then((fetchedTransactions) => {
        setTransactions(fetchedTransactions);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [publicKey]);

  // Initial fetch and fetch when publicKey changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Define the refetch function
  const refetch = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, error, refetch };
};
