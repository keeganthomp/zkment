import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatAddress } from "@/utils/solana";
import { useTokenBalances } from "@/context/tokenBalancesContext";
import { useEffect, useRef } from "react";

const ConnectWalletButton = () => {
  const { setVisible } = useWalletModal();
  const { publicKey: connectedWallet } = useWallet();
  const { solBalance, fetchSolBalance } = useTokenBalances();
  const hasCalledFetchBalance = useRef(false);

  useEffect(() => {
    if (connectedWallet && !hasCalledFetchBalance.current) {
      fetchSolBalance();
      hasCalledFetchBalance.current = true;
    }

    // Reset the ref when wallet is disconnected
    if (!connectedWallet) {
      hasCalledFetchBalance.current = false;
    }
  }, [connectedWallet, fetchSolBalance]);

  if (connectedWallet) {
    return (
      <div className="flex flex-col justify-center items-center gap-0 px-4">
        <p className="font-light text-gray-700">{formatAddress(connectedWallet.toBase58())}</p>
        <p className="text-sm font-thin text-gray-500 relative top-[-5px]">
          {solBalance} SOL
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <button onClick={() => setVisible(true)}>Connect Wallet</button>
    </div>
  );
};

export default ConnectWalletButton;