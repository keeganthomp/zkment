import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useZKCompression } from "@/context/zkCompressionContext";

type Props = {
  mint: string;
  onSubmit: () => void;
};

const MintTokensForm = ({ mint, onSubmit }: Props) => {
  const { publicKey: connectedWallet } = useWallet();
  const { mintTokens } = useZKCompression();
  const [amount, setAmount] = useState<string | number>("");
  const [recipient, setRecipient] = useState(connectedWallet?.toBase58() || "");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const canSend = amount && Number(amount) > 0 && recipient.length > 0;

  const handleMint = async () => {
    if (!canSend) return;
    try {
      setIsSending(true);
      await mintTokens({
        mint: new PublicKey(mint),
        to: new PublicKey(recipient),
        amount: Number(amount),
      });
      toast({
        title: "Tokens minted",
        description: "Tokens minted successfully",
      });
      onSubmit();
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
      setIsSending(false);
    }
  };

  return (
    <div>
      <div className="pb-5 flex flex-col gap-2">
        <div>
          <Label>Amount</Label>
          <Input
            disabled={isSending}
            type="number"
            placeholder="100"
            value={amount}
            onChange={(e) => {
              if (Number(e.target.value) > 0) {
                setAmount(Number(e.target.value));
              } else {
                setAmount("");
              }
            }}
          />
        </div>
        <div>
          <Label>Recipient</Label>
          <Input
            disabled={isSending}
            type="text"
            placeholder="0xqwerty..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
      </div>
      {isSending ? (
        <div className="flex justify-center h-9 items-center">
          <Loader className="w-5" />
        </div>
      ) : (
        <Button className="w-full" disabled={!canSend} onClick={handleMint}>
          Mint
        </Button>
      )}
    </div>
  );
};

export default MintTokensForm;
