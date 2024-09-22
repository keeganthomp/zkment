import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useZKCompression } from "@/context/zkCompressionContext";
import { MintCreatedModal } from "@/components/modals/MintCreatedSuccess";

type Props = {
  onSubmit?: () => void;
};

const CreateMint = ({ onSubmit }: Props) => {
  const { publicKey: connectedWallet } = useWallet();
  const { createMint } = useZKCompression();
  const { toast } = useToast();
  const [authority, setAuthority] = useState(connectedWallet?.toBase58() || "");
  const [decimals, setDecimals] = useState<string | number>(9);
  const [isCreating, setIsCreating] = useState(false);
  const [newMintAddress, setNewMintAddress] = useState<string | null>(null);

  const canSend = !!authority && decimals !== "";

  const handleCreateMint = async () => {
    if (!canSend) return;
    try {
      setIsCreating(true);
      const { mint: newMintAddress } = await createMint({
        authority: new PublicKey(authority),
        decimals: Number(decimals || 0),
      });
      setNewMintAddress(newMintAddress.toBase58());
      onSubmit?.();
    } catch (error: any) {
      const isInsufficientBalance = error?.message
        ?.toLowerCase()
        .includes("not enough balance");
      if (isInsufficientBalance) {
        console.log("Insufficient balance");
        toast({
          title: "Insufficient balance",
          description: "You do not have enough balance to send tokens",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred while sending tokens",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!connectedWallet) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-gray-500 font-thin">
          Connect your wallet to create a mint
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center w-full">
        <div className="max-w-md flex-1">
          <h1 className="text-4xl font-semibold text-gray-700 pb-7 w-full">
            Create Mint
          </h1>
          <div className="pb-5">
            <div className="w-full">
              <Label>Decimals</Label>
              <Input
                 className="w-full"
                disabled={isCreating}
                type="number"
                placeholder="9"
                value={decimals}
                onChange={(e) => {
                  if (Number(e.target.value) > 0) {
                    setDecimals(Number(e.target.value));
                  } else {
                    setDecimals("");
                  }
                }}
              />
            </div>
            <div>
              <Label>Authority</Label>
              <Input
                disabled={isCreating}
                type="text"
                placeholder="0xqwerty..."
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
              />
            </div>
          </div>
          {isCreating ? (
            <div className="flex justify-center h-9 items-center">
              <Loader className="w-5" />
            </div>
          ) : (
            <Button
              className="w-full bg-gray-700 hover:bg-gray-600"
              disabled={!canSend}
              onClick={handleCreateMint}
            >
              Create Mint
            </Button>
          )}
        </div>
      </div>
      <MintCreatedModal
        isOpen={!!newMintAddress}
        onClose={() => setNewMintAddress(null)}
        mintAddress={newMintAddress || ""}
      />
    </>
  );
};

export default CreateMint;
