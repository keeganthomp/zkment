import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useZKCompression } from "@/context/zkCompressionContext";
import TokenInfoModal from "@/components/modals/CompressedTokenInfoModal";
import { CompressedTokenInfo } from "@/context/zkCompressionContext";
import { MintTokensModal } from "@/components/modals/MintTokensModal";
import { SendCompressedTokensModal } from "@/components/modals/SendCompressedTokensModal";
import { DecompressTokenModal } from "@/components/modals/DecompressTokenModal";
import { SendHorizontal, Coins, RefreshCcw } from "lucide-react";

const WalletInfo = () => {
  const { publicKey: connectedWallet } = useWallet();
  const { fetCompressedTokenBalances, compressedTokens } = useZKCompression();
  const hasFetchedRef = useRef(false);

  const [isFetchingCompressedTokens, setIsFetchingCompressedTokens] =
    useState(false);
  const [isViewingTokenInfo, setIsViewingTokenInfo] = useState(false);
  const [isMintingTokens, setIsMintingTokens] = useState(false);
  const [isSendingTokens, setIsSendingTokens] = useState(false);
  const [isDecompressingTokens, setIsDecompressingTokens] = useState(false);
  const [selectedToken, setSelectedToken] =
    useState<CompressedTokenInfo | null>(null);

  useEffect(() => {
    const canFetchCompressedInfo = connectedWallet && !hasFetchedRef.current;
    if (canFetchCompressedInfo) {
      setIsFetchingCompressedTokens(true);
      fetCompressedTokenBalances().finally(() => {
        setIsFetchingCompressedTokens(false);
      });
      hasFetchedRef.current = true;
    }
  }, [connectedWallet, fetCompressedTokenBalances]);

  if (!connectedWallet) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-gray-500 font-thin">
          Connect your wallet to view your compressed tokens
        </p>
      </div>
    );
  }

  if (isFetchingCompressedTokens && !compressedTokens.length) {
    return (
      <div className="flex flex-col gap-1 justify-center items-center">
        <Loader className="w-5 h-5" />
        <p className="text-gray-500 font-thin">fetching compressed tokens...</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-4xl font-semibold text-gray-700 pb-5">
          Compressed Wallet
        </h1>
        <div>
          <div className="grid grid-cols-[1fr_150px_300px] gap-4 h-8 px-2 text-gray-700 underline">
            <h3>Mint</h3>
            <h3 className="text-right">Balance</h3>
          </div>
          {compressedTokens?.map((token) => (
            <div
              className="grid grid-cols-[1fr_150px_300px] gap-4 cursor-pointer hover:bg-gray-50 transition-colors h-12 px-2 text-gray-600 font-light rounded"
              key={token.mint}
            >
              <div
                onClick={() => {
                  setSelectedToken(token);
                  setIsViewingTokenInfo(true);
                }}
                className="flex items-center"
              >
                <p>{token.mint}</p>
              </div>
              <div
                onClick={() => {
                  setSelectedToken(token);
                  setIsViewingTokenInfo(true);
                }}
                className="flex items-center justify-end"
              >
                <p>{token.balance}</p>
              </div>
              <div className="flex justify-end items-center gap-2">
                <Button
                  className="bg-gray-500 h-7 font-light px-2"
                  onClick={() => {
                    setSelectedToken(token);
                    setIsMintingTokens(true);
                  }}
                >
                  Mint
                  <Coins className="ml-1" size={16} strokeWidth={1.25} />
                </Button>
                <Button
                  className="bg-gray-500 h-7 font-light px-2"
                  onClick={() => {
                    setSelectedToken(token);
                    setIsSendingTokens(true);
                  }}
                >
                  Send
                  <SendHorizontal
                    className="ml-1"
                    strokeWidth={1.25}
                    size={16}
                  />
                </Button>
                <Button
                  className="bg-gray-500 h-7 font-light px-2"
                  onClick={() => {
                    setSelectedToken(token);
                    setIsDecompressingTokens(true);
                  }}
                >
                  Decompress
                  <RefreshCcw className="ml-1" strokeWidth={1.25} size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TokenInfoModal
        open={isViewingTokenInfo}
        token={selectedToken}
        onClose={() => {
          setSelectedToken(null);
          setIsViewingTokenInfo(false);
        }}
      />
      <MintTokensModal
        open={isMintingTokens}
        onClose={() => setIsMintingTokens(false)}
        mint={selectedToken?.mint}
      />
      <SendCompressedTokensModal
        open={isSendingTokens}
        onClose={() => setIsSendingTokens(false)}
        mint={selectedToken?.mint}
      />
      <DecompressTokenModal
        open={isDecompressingTokens}
        onClose={() => setIsDecompressingTokens(false)}
        mint={selectedToken?.mint}
      />
    </>
  );
};

export default WalletInfo;
