import { useState, useEffect, useCallback, useRef } from "react";
import { PublicKey } from "@solana/web3.js";
import { getTransactions } from "@/utils/solana";

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
  const hasFetchedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Define the fetch function using useCallback to memoize it
  const fetchTransactions = useCallback(
    async (showLoading = true) => {
      if (!publicKey) {
        setError(new Error("Wallet not connected"));
        return;
      }
      setIsLoading(showLoading);
      setError(null);
      try {
        const fetchedTransactions = await getTransactions(publicKey);
        setTransactions(fetchedTransactions);
        hasFetchedRef.current = true;
      } catch (err: any) {
        setError(err);
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey]
  );

  useEffect(() => {
    // Function to start polling
    const startPolling = () => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Set up a new interval to fetch every 2.5 seconds (2500 milliseconds)
      intervalRef.current = setInterval(() => {
        fetchTransactions(false);
      }, 2500);
    };

    if (publicKey) {
      if (!hasFetchedRef.current) {
        // Perform the initial fetch
        fetchTransactions().then(() => {
          // Start polling after the initial fetch completes
          startPolling();
        });
      } else {
        // If already fetched, start polling immediately
        startPolling();
      }
    }

    // Cleanup function to clear the interval when component unmounts or publicKey changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [publicKey, fetchTransactions]);

  // Define the refetch function
  const refetch = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, error, refetch };
};
