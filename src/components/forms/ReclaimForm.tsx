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
        console.log("Error", error);
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
      <p className="text-gray-400 font-light text-xs pb-0 leading-[15px] italic pt-1">
        This will compress all the tokens in the ATA. After compression, the
        original ATA will be closed and the rent will be reclaimed.
      </p>
      <div className="flex gap-2 text-gray-700 text-lg font-light">
        <p className="">Tokens to Compress:</p>
        <p>{tokenAccount.amount}</p>
      </div>
      {isCompressing ? (
        <div className="flex justify-center h-9 items-center">
          <Loader className="w-5" />
        </div>
      ) : (
        <Button className="w-full" onClick={handleReclaim}>
          Reclaim Rent
        </Button>
      )}
    </div>
  );
};

export default ReclaimForm;
