import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { getTransactions } from "../utils/solana";

interface UseTransactionsResult {
  transactions: any[];
  isLoading: boolean;
  error: Error | null;
}

export const useTransactions = (
  publicKey: PublicKey | null,
): UseTransactionsResult => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (publicKey) {
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
    }
  }, [publicKey]);

  return { transactions, isLoading, error };
};
