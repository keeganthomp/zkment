import { createContext, useContext, useState } from "react";
import { getSolBalance, getSPLTokenBalances } from "@/utils/solana";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { TokenAccount } from "@/utils/solana";

interface TokenBalancesContextType {
  solBalance: number;
  splTokenBalances: TokenAccount[];
  isFetchingSolBalance: boolean;
  isFetchingTokenBalances: boolean;
  fetchTokenBalances: () => Promise<void>;
  fetchSolBalance: () => Promise<void>;
}

const TokenBalancesContext = createContext<
  TokenBalancesContextType | undefined
>(undefined);

export const useTokenBalances = () => {
  const context = useContext(TokenBalancesContext);
  if (!context) {
    throw new Error(
      "useTokenBalances must be used within a TokenBalancesProvider",
    );
  }
  return context;
};

export const TokenBalancesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [isFetchingSolBalance, setIsFetchingSolBalance] = useState(false);
  const [isFetchingTokenBalances, setIsFetchingTokenBalances] = useState(false);
  const [solBalance, setSolBalance] = useState(0);
  const [splTokenBalances, setSplTokenBalances] = useState<TokenAccount[]>([]);

  const fetchTokenBalances = async () => {
    if (!publicKey) return;
    setIsFetchingTokenBalances(true);
    console.log("fetching token balances...");
    try {
      const splTokenBalances = await getSPLTokenBalances(publicKey.toString());
      setSplTokenBalances(splTokenBalances);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    } finally {
      setIsFetchingTokenBalances(false);
    }
  };

  const fetchSolBalance = async () => {
    if (!publicKey) return;
    console.log("fetching sol balance...");
    setIsFetchingSolBalance(true);
    try {
      const solBalance = await getSolBalance(connection, publicKey.toString());
      setSolBalance(Number(solBalance.toFixed(2)));
    } catch (error) {
      console.error("Error fetching sol balance:", error);
    } finally {
      setIsFetchingSolBalance(false);
    }
  };

  return (
    <TokenBalancesContext.Provider
      value={{
        solBalance,
        splTokenBalances,
        isFetchingSolBalance,
        isFetchingTokenBalances,
        fetchTokenBalances,
        fetchSolBalance,
      }}
    >
      {children}
    </TokenBalancesContext.Provider>
  );
};

export default TokenBalancesContext;
