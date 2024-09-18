import { createContext, useContext, useState } from "react";
import { TokenAccount } from "@/utils/solana";

export type CompressedTokenInfo = {
  mint: string;
  balance: number;
  compressed: boolean;
};

interface TokenContextType {
  solBalance: number;
  splTokenAccounts: TokenAccount[];
  compressedTokens: CompressedTokenInfo[];
  setSolBalance: (balance: number) => void;
  setSplTokenAccounts: (balances: TokenAccount[]) => void;
  setCompressedTokens: (balances: CompressedTokenInfo[]) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokens must be used within a Token");
  }
  return context;
};

export const TokenContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useState("");
  const [solBalance, setSolBalance] = useState(0);
  const [splTokenAccounts, setSplTokenAccounts] = useState<TokenAccount[]>([]);
  const [compressedTokens, setCompressedTokens] = useState<
    CompressedTokenInfo[]
  >([]);

  return (
    <TokenContext.Provider
      value={{
        solBalance,
        splTokenAccounts,
        setSolBalance,
        setSplTokenAccounts,
        compressedTokens,
        setCompressedTokens,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export default TokenContext;
