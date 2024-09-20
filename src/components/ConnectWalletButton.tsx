import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatAddress } from "@/utils/solana";
import { useSolBalance } from "@/hooks/useSolBalance";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { WalletMinimal } from "lucide-react";

const WalletInfo = ({
  connectedWallet,
  balance,
  onPress,
}: {
  connectedWallet: string;
  balance: string | number;
  onPress: () => void;
}) => {
  return (
    <button
      onClick={onPress}
      className="flex flex-col gap-0 px-4 rounded-md cursor-pointer hover:bg-gray-50 w-full"
    >
      <div className="flex items-center gap-1">
        <WalletMinimal strokeWidth={1.25} size={16} />
        <p className="font-light text-gray-700">
          {formatAddress(connectedWallet)}
        </p>
      </div>
      <p className="text-sm font-thin text-gray-500 relative top-[-5px]">
        {balance} SOL
      </p>
    </button>
  );
};

const WalletPopoverMenu = ({ closePopover }: { closePopover: () => void }) => {
  const { toast } = useToast();
  const { disconnect, publicKey: connectedWallet } = useWallet();

  const handleCopyAddress = () => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet.toBase58());
      toast({
        title: "Copied to clipboard",
        description: "Wallet address has been copied to your clipboard",
      });
      closePopover();
    }
  };

  const handleDisconnect = () => {
    disconnect();
    closePopover();
  };

  return (
    <div className="flex flex-col gap-0 items-start justify-start rounded">
      <button
        onClick={handleCopyAddress}
        className="h-9 px-3 w-full text-left text-xs font-semibold cursor-pointer hover:bg-gray-50"
      >
        Copy Address
      </button>
      <button
        onClick={handleDisconnect}
        className="h-9 px-3 w-full text-left text-xs font-semibold cursor-pointer hover:bg-gray-50"
      >
        Disconnect
      </button>
    </div>
  );
};

const ConnectWalletButton = () => {
  const { setVisible } = useWalletModal();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { publicKey: connectedWallet } = useWallet();
  const { solBalance } = useSolBalance();

  if (connectedWallet) {
    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={() => setIsPopoverOpen(false)}
      >
        <PopoverAnchor className="flex items-center justify-center">
          <WalletInfo
            connectedWallet={connectedWallet.toBase58()}
            balance={solBalance}
            onPress={() => setIsPopoverOpen(true)}
          />
        </PopoverAnchor>
        <PopoverContent className="w-36 p-0">
          <WalletPopoverMenu closePopover={() => setIsPopoverOpen(false)} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center px-4">
      <button
        className="bg-gray-700 h-10 rounded-md text-white text-sm w-full"
        onClick={() => setVisible(true)}
      >
        Connect Wallet
      </button>
    </div>
  );
};

export default ConnectWalletButton;
