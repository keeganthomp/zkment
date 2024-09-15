import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useZKCompression } from "@/context/zkCompressionContext";
import { PublicKey } from "@solana/web3.js";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";

type Props = {
  mint: string
  onSubmit: () => void;
};

const DecompressTokensForm = ({
  mint,
  onSubmit,
}: Props) => {
  const { descompressToken } = useZKCompression();
  const [amount, setAmount] = useState<string | number>("");
  const [isDecompressing, setIsDecompressing] = useState(false);
  const { toast } = useToast();

  const canSend = amount && Number(amount) > 0;

  const handleDecompress = async () => {
    if (!canSend) return;
    try {
      setIsDecompressing(true);
      await descompressToken({
        mint: new PublicKey(mint),
        amount: Number(amount),
      });
      toast({
        title: "Tokens decompressed",
        description: "Tokens decompressed successfully",
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
          description: "You do not have enough balance to decompress tokens",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred while decompressing tokens",
          variant: "destructive",
        });
      }
      console.log("error: ", error);
    } finally {
      setIsDecompressing(false);
    }
  };

  return (
    <div>
      <div className="pb-5 flex flex-col gap-2">
        <div>
          <Label>Amount</Label>
          <div className="flex items-center gap-2">
            <Input
              disabled={isDecompressing}
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
            <Button
              type="button"
              variant="secondary"
              size="sm"
              // onClick={() => setAmount(compressedBalance)}
              disabled={isDecompressing}
            >
              Max
            </Button>
          </div>
        </div>
      </div>
      {isDecompressing ? (
        <div className="flex justify-center h-9 items-center">
          <Loader className="w-5" />
        </div>
      ) : (
        <Button
          className="w-full"
          disabled={!canSend}
          onClick={handleDecompress}
        >
          Decompress
        </Button>
      )}
    </div>
  );
};

export default DecompressTokensForm;
