import { openExplorerUrl } from "../utils/solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader } from "@/components/ui/loader";
import moment from "moment";
import { useTransactions } from "@/hooks/useTransactions";
import { RotateCcw } from "lucide-react";

const Transactions = () => {
  const { publicKey } = useWallet();
  const { transactions, isLoading, error, refetch } =
    useTransactions(publicKey);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 justify-center items-center">
        <Loader className="w-5 h-5" />
        <p className="text-gray-500 font-thin">fetching transactions...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!transactions?.length) return null;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-700 pb-5">
          Transactions
        </h1>
        <button
          disabled={isLoading}
          onClick={refetch}
          className="bg-gray-100 p-2 rounded-md hover:bg-white transition-colors"
        >
          <RotateCcw strokeWidth={1.25} size={20} />
        </button>
      </div>
      <div>
        {error ? (
          <p className="text-red-500 font-light text-sm text-center">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-[120px_1fr] gap-4 h-8 px-2 text-gray-700 underline">
              <h3>Time</h3>
              <h3>Signature</h3>
            </div>
            {transactions.map((txn) => (
              <div
                onClick={() => openExplorerUrl(txn.signature, true)}
                className="grid grid-cols-[120px_1fr] gap-4 cursor-pointer hover:bg-gray-50 transition-colors h-12 px-2 text-gray-600 font-light rounded"
                key={txn.signature}
              >
                <div className="text-sm flex items-center hover:underline">
                  <p>{moment.unix(txn.blockTime).fromNow()}</p>
                </div>
                <div className="flex items-center justify-start">
                  <p className="text-left">{txn.signature}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
