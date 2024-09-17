import { getTransactions, openExplorerUrl } from "../utils/solana";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader } from "@/components/ui/loader";
import moment from "moment";

const Transactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const { publicKey } = useWallet();

  useEffect(() => {
    if (publicKey) {
      setIsFetchingTransactions(true);
      getTransactions(publicKey)
        .then(setTransactions)
        .finally(() => {
          setIsFetchingTransactions(false);
        });
    }
  }, [publicKey]);

  if (isFetchingTransactions) {
    return (
      <div className="flex flex-col gap-1 justify-center items-center">
        <Loader className="w-5 h-5" />
        <p className="text-gray-500 font-thin">fetching transactions...</p>
      </div>
    );
  }

  if (!transactions?.length) return null;

  return (
    <div>
      <h1 className="text-4xl font-semibold text-gray-700 pb-5">Transactions</h1>
      <div>
        <div className="grid grid-cols-[120px_1fr] gap-4 h-8 px-2 text-gray-700 underline">
          <h3>Date</h3>
          <h3>Signature</h3>
        </div>
        {transactions?.map((txn) => (
          <div
            onClick={() => openExplorerUrl(txn?.signature, true)}
            className="grid grid-cols-[120px_1fr] gap-4 cursor-pointer hover:bg-gray-50 transition-colors h-12 px-2 text-gray-600 font-light rounded"
            key={txn?.signature}
          >
            <div className="text-sm flex items-center hover:underline">
              <p>{moment.unix(txn?.blockTime).fromNow()}</p>
            </div>
            <div className="flex items-center justify-start">
              <p className="text-left">{txn?.signature}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
