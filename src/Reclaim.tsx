import { useTokenBalances } from "@/context/tokenBalancesContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { ReclaimModal } from "@/components/modals/ReclaimModal";
import { TokenAccount } from "@/utils/solana";

const Reclaim = () => {
  const { publicKey: connectedWallet } = useWallet();
  const [isReclaiming, setIsReclaiming] = useState(false);
  const [selectedTokenAccount, setSelectedTokenAccount] = useState<TokenAccount | null>(null);
  const { splTokenBalances, fetchTokenBalances, isFetchingTokenBalances } =
    useTokenBalances();
  const hasCalledFetchTokenBalances = useRef(false);

  console.log("SPL token balances", splTokenBalances);

  useEffect(() => {
    if (connectedWallet && !hasCalledFetchTokenBalances.current) {
      fetchTokenBalances();
      hasCalledFetchTokenBalances.current = true;
    }
    // Reset the ref when wallet is disconnected
    if (!connectedWallet) {
      hasCalledFetchTokenBalances.current = false;
    }
  }, [connectedWallet, fetchTokenBalances]);

  if (isFetchingTokenBalances && !splTokenBalances.length) {
    return (
      <div className="flex flex-col gap-1 justify-center items-center">
        <Loader className="w-5 h-5" />
        <p className="text-gray-500 font-thin">fetching SPL tokens...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-4xl font-semibold text-gray-700 pb-5">
          SPL Wallet
        </h1>
        <div>
          <div className="grid grid-cols-[1fr_150px_150px] gap-4 h-8 px-2 text-gray-700 underline">
            <h3>Mint</h3>
            <h3 className="text-right">Balance</h3>
            <h3 className="text-center">Action</h3>
          </div>
          {splTokenBalances?.map((token) => (
            <div
              className="grid grid-cols-[1fr_150px_150px] gap-4 cursor-pointer hover:bg-gray-50 transition-colors h-12 px-2 text-gray-600 font-light rounded"
              key={token.mint}
            >
              <div className="flex items-center">
                <p>{token.mint}</p>
              </div>
              <div className="flex items-center justify-end">
                <p className="text-right">{token.amount}</p>
              </div>
              <div className="flex justify-center items-center">
                <Button
                  onClick={() => {
                    setSelectedTokenAccount(token);
                    setIsReclaiming(true);
                  }}
                  className="bg-gray-700 h-7 font-light px-2">
                  Reclaim
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ReclaimModal
        open={isReclaiming}
        onClose={() => setIsReclaiming(false)}
        tokenAccount={selectedTokenAccount}
      />
    </>
  );
};

export default Reclaim;
