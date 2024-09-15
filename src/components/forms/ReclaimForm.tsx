import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useZKCompression } from "@/context/zkCompressionContext";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { TokenAccount } from "@/utils/solana";

type Props = {
  tokenAccount: TokenAccount;
  onSubmit: () => void;
};

const ReclaimForm = ({ tokenAccount, onSubmit }: Props) => {
  const { compressAndReclaimRent } = useZKCompression();
  const [isCompressing, setIsCompressing] = useState(false);
  const { toast } = useToast();

  const handleReclaim = async () => {
    console.log("token account", tokenAccount);
    try {
      setIsCompressing(true);
      await compressAndReclaimRent({
        mint: new PublicKey(tokenAccount.mint),
        amount: Number(tokenAccount.amount),
      });
      toast({
        title: "Rent reclaimed!",
        description: "Tokens compressed successfully",
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
          description: "You do not have enough balance to compress",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred while compressing tokens",
          variant: "destructive",
        });
      }
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="font-light">
        <p className="text-gray-500 text-sm pb-0 leading-[15px] italic">
          This will compress all the tokens in the ATA. This will reclaim all
          the rent currently being help in the ATA. The compressed mint address
          will remain the same.
        </p>
      </div>
      <div className="flex gap-2 text-gray-700 text-lg font-light">
        <p className="">Amount to Compress:</p>
        <p>{tokenAccount.amount}</p>
      </div>
      {isCompressing ? (
        <div className="flex justify-center h-9 items-center">
          <Loader className="w-5" />
        </div>
      ) : (
        <Button
          className="w-full"
          disabled={!tokenAccount.amount}
          onClick={handleReclaim}
        >
          Reclaim
        </Button>
      )}
    </div>
  );
};

export default ReclaimForm;
