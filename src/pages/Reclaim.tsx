import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { ReclaimModal } from "@/components/modals/ReclaimModal";
import { TokenAccount } from "@/utils/solana";
import { useSplTokenAccounts } from "@/hooks/useSplTokenAccounts";
import { RotateCcw } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

const Reclaim = () => {
  const { publicKey: connectedWallet } = useWallet();
  const {
    splTokenAccounts,
    isFetching: isFetchingSplTokenAccounts,
    refetch: refetchSplTokenAccounts,
    error: errorFetchingSplTokenAccounts,
  } = useSplTokenAccounts();
  const [isReclaiming, setIsReclaiming] = useState(false);
  const [selectedTokenAccount, setSelectedTokenAccount] =
    useState<TokenAccount | null>(null);

  if (!connectedWallet) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-gray-500 font-thin">
          Connect your wallet to reclaim rent
        </p>
      </div>
    );
  }

  if (isFetchingSplTokenAccounts) {
    return (
      <div className="flex flex-col gap-1 justify-center items-center">
        <Loader className="w-5 h-5" />
        <p className="text-gray-500 font-thin">
          fetching SPL token accounts...
        </p>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-semibold text-gray-700 pb-7">
            Compress & Reclaim
          </h1>
          <button
            disabled={isFetchingSplTokenAccounts}
            onClick={refetchSplTokenAccounts}
            className="bg-gray-100 p-2 rounded-md hover:bg-white transition-colors"
          >
            <RotateCcw strokeWidth={1.25} size={20} />
          </button>
        </div>
        <div>
          {errorFetchingSplTokenAccounts ? (
            <p className="text-red-500 font-light text-sm text-center">
              {errorFetchingSplTokenAccounts}
            </p>
          ) : splTokenAccounts.length === 0 ? (
            <p className="text-gray-500 font-thin">
              No SPL token accounts to reclaim rent from
            </p>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_150px_150px] gap-4 h-8 px-2 text-gray-700 underline">
                <h3>Mint</h3>
                <h3 className="text-right">Balance</h3>
                <h3 className="text-center">Action</h3>
              </div>
              {splTokenAccounts?.map((token) => (
                <div
                  className="grid grid-cols-[1fr_150px_150px] gap-4 cursor-pointer hover:bg-gray-50 transition-colors h-12 px-2 text-gray-500 font-light rounded"
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
                      className="bg-gray-700 h-7 font-light px-2"
                    >
                      Reclaim
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
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
