import React, { createContext, useContext } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getLightRpc, getTxnForSigning } from "@/utils/zkCompression";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import { PublicKey } from "@solana/web3.js";
import {
  createZKMintIx,
  createZKTransferIx,
  createCompressTokenIx,
  createDecompressTokenIx,
} from "@/utils/zkInstructions";
import { TokenMetadata } from "@solana/spl-token-metadata";
import { Rpc } from "@lightprotocol/stateless.js";
import { createCloseAccountIx } from "@/utils/solana";
import { getAssociatedTokenAddress } from "@/utils/solana";

type CreateMintArgs = {
  authority?: PublicKey;
  decimals?: number;
  metadata?: TokenMetadata;
};

type MintCompressedTokenArgs = {
  to: PublicKey;
  amount: number;
  mint: PublicKey;
  authority?: PublicKey;
};

type CompressTokenArgs = {
  mint: PublicKey;
  amount: number;
};

type DecompressTokenArgs = {
  mint: PublicKey;
  amount: number;
};

type BaseTxnResult = {
  txnSignature: string;
};

type TransferTokensArgs = {
  to: PublicKey;
  amount: number;
  mint: PublicKey;
};

export type CompressedTokenInfo = {
  mint: string;
  balance: number;
  compressed: boolean;
};

interface ZKCompressionContext {
  lightRpc: Rpc;
  createMint: (
    args?: CreateMintArgs,
  ) => Promise<BaseTxnResult & { mint: PublicKey }>;
  mintTokens: (args: MintCompressedTokenArgs) => Promise<BaseTxnResult>;
  transferTokens: (args: TransferTokensArgs) => Promise<BaseTxnResult>;
  compressToken: (args: CompressTokenArgs) => Promise<BaseTxnResult>;
  descompressToken: (args: DecompressTokenArgs) => Promise<BaseTxnResult>;
  reclaimRent: (args: {
    mint: PublicKey;
    owner: PublicKey;
  }) => Promise<BaseTxnResult>;
  compressAndReclaimRent: (args: CompressTokenArgs) => Promise<BaseTxnResult>;
}

const ZKCompressionContext = createContext<ZKCompressionContext | undefined>(
  undefined,
);

export function ZKCompressionProvider({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  const { publicKey: connectedWallet, sendTransaction } = useWallet();

  const createMint = async (
    { authority = connectedWallet as PublicKey, decimals = 9 } = {
      authority: connectedWallet as PublicKey,
      decimals: 9,
    } as CreateMintArgs,
  ) => {
    if (!connectedWallet) {
      throw new Error("No connected wallet");
    }
    const lightRpc = getLightRpc();

    console.log("getting blockhash...");
    const {
      context: { slot: minContextSlot },
      value: blockhashCtx,
    } = await lightRpc.getLatestBlockhashAndContext();

    const { instructions, mintKp } = await createZKMintIx({
      creator: connectedWallet,
      authority,
      decimals,
    });

    console.log("Getting txn for signing...");
    const transaction = getTxnForSigning(
      instructions,
      connectedWallet,
      blockhashCtx.blockhash,
      [mintKp],
    );

    console.log("sending tx for signing...");
    const txnSignature = await sendTransaction(transaction, lightRpc, {
      signers: [mintKp],
      minContextSlot,
    });

    console.log("confirming tx...");
    await lightRpc.confirmTransaction({
      blockhash: blockhashCtx.blockhash,
      lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
      signature: txnSignature,
    });

    console.log("tx confirmed:", txnSignature);
    console.log("new mint:", mintKp.publicKey);
    return { txnSignature, mint: mintKp.publicKey };
  };

  const mintTokens = async ({
    to,
    amount,
    mint,
    authority,
  }: MintCompressedTokenArgs) => {
    if (!connectedWallet) {
      throw new Error("No connected wallet");
    }
    const lightRpc = getLightRpc();

    console.log("getting blockhash...");
    const {
      context: { slot: minContextSlot },
      value: blockhashCtx,
    } = await lightRpc.getLatestBlockhashAndContext();

    console.log("creating mint to instructions...");
    const ix = await CompressedTokenProgram.mintTo({
      feePayer: connectedWallet,
      mint,
      authority: authority ?? connectedWallet,
      amount,
      toPubkey: to,
    });

    console.log("building txn...");
    const transaction = getTxnForSigning(
      ix,
      connectedWallet,
      blockhashCtx.blockhash,
    );

    console.log("sending tx for signing...");
    const signature = await sendTransaction(transaction, lightRpc, {
      minContextSlot,
    });

    console.log("confirming tx...");
    await lightRpc.confirmTransaction({
      blockhash: blockhashCtx.blockhash,
      lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
      signature,
    });

    console.log("tx confirmed", signature);
    return { txnSignature: signature };
  };

  const transferTokens = async ({ to, amount, mint }: TransferTokensArgs) => {
    if (!connectedWallet) {
      throw new Error("No connected wallet");
    }
    const lightRpc = getLightRpc();

    console.log("getting blockhash...");
    const {
      context: { slot: minContextSlot },
      value: blockhashCtx,
    } = await lightRpc.getLatestBlockhashAndContext();

    const { instructions } = await createZKTransferIx({
      owner: connectedWallet,
      mint,
      amount,
      to,
    });

    console.log("building txn...");
    const transaction = getTxnForSigning(
      instructions,
      connectedWallet,
      blockhashCtx.blockhash,
    );

    console.log("sending tx for signing...");
    const signature = await sendTransaction(transaction, lightRpc, {
      minContextSlot,
    });

    console.log("confirming tx...");
    await lightRpc.confirmTransaction({
      blockhash: blockhashCtx.blockhash,
      lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
      signature,
    });

    console.log("tx confirmed", signature);
    return {
      txnSignature: signature,
    };
  };

  // compress existing NON-compressed SPL token
  const compressToken = async ({ mint, amount }: CompressTokenArgs) => {
    if (!connectedWallet) {
      throw new Error("No connected wallet");
    }

    const lightRpc = getLightRpc();

    console.log("getting blockhash...");
    const {
      context: { slot: minContextSlot },
      value: blockhashCtx,
    } = await lightRpc.getLatestBlockhashAndContext();

    console.log("creating compress token instructions...");
    const { instructions } = await createCompressTokenIx({
      receiver: connectedWallet,
      mint,
      amount,
    });

    console.log("building txn...");
    const transaction = getTxnForSigning(
      instructions,
      connectedWallet,
      blockhashCtx.blockhash,
    );

    console.log("sending tx for signing...");
    const signature = await sendTransaction(transaction, lightRpc, {
      // skipPreflight: true,
      minContextSlot,
    });

    console.log("confirming tx...");
    await lightRpc.confirmTransaction({
      blockhash: blockhashCtx.blockhash,
      lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
      signature,
    });

    console.log("tx confirmed", signature);
    return {
      txnSignature: signature,
    };
  };

  const reclaimRent = async ({
    mint,
    owner,
  }: {
    mint: PublicKey;
    owner: PublicKey;
  }) => {
    if (!connectedWallet) {
      throw new Error("No connected wallet");
    }

    const ata = getAssociatedTokenAddress({
      owner,
      mint,
    });

    if (!ata) {
      throw new Error("No associated token address found");
    }

    const lightRpc = getLightRpc();

    console.log("getting blockhash...");
    const {
      context: { slot: minContextSlot },
      value: blockhashCtx,
    } = await lightRpc.getLatestBlockhashAndContext();

    const closeAccountIx = await createCloseAccountIx({
      ata: ata.toBase58(),
      owner: owner.toBase58(),
    });

    console.log("building txn...");
    const transaction = getTxnForSigning(
      closeAccountIx,
      connectedWallet,
      blockhashCtx.blockhash,
    );

    console.log("sending tx for signing...");
    const signature = await sendTransaction(transaction, lightRpc, {
      minContextSlot,
    });

    console.log("confirming tx...");
    await lightRpc.confirmTransaction({
      blockhash: blockhashCtx.blockhash,
      lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
      signature,
    });

    console.log("tx confirmed", signature);
    return {
      txnSignature: signature,
    };
  };

  const compressAndReclaimRent = async ({
    mint,
    amount,
  }: CompressTokenArgs) => {
    if (!connectedWallet) {
      throw new Error("No connected wallet");
    }

    const lightRpc = getLightRpc();

    console.log("getting blockhash...");
    const {
      context: { slot: minContextSlot },
      value: blockhashCtx,
    } = await lightRpc.getLatestBlockhashAndContext();

    const instructions = [];

    let ata: PublicKey | undefined;
    if (amount > 0) {
      console.log("creating compress token instructions...");
      const { instructions: compressTokensIx, ata: ownerAta } =
        await createCompressTokenIx({
          receiver: connectedWallet,
          mint,
          amount,
        });
      ata = ownerAta;
      instructions.push(...compressTokensIx);
    } else {
      ata = getAssociatedTokenAddress({
        owner: connectedWallet,
        mint,
      });
    }

    const closeAccountIx = await createCloseAccountIx({
      ata: ata?.toBase58() as string,
      owner: connectedWallet.toBase58(),
    });
    instructions.push(closeAccountIx);

    console.log("building txn...");
    const transaction = getTxnForSigning(
      instructions,
      connectedWallet,
      blockhashCtx.blockhash,
    );

    console.log("sending tx for signing...");
    const signature = await sendTransaction(transaction, lightRpc, {
      minContextSlot,
    });

    console.log("confirming tx...");
    await lightRpc.confirmTransaction({
      blockhash: blockhashCtx.blockhash,
      lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
      signature,
    });

    console.log("tx confirmed", signature);
    return {
      txnSignature: signature,
    };
  };

  // decompress existing compressed token
  const descompressToken = async ({ mint, amount }: DecompressTokenArgs) => {
    if (!connectedWallet) {
      throw new Error("No connected wallet");
    }

    const lightRpc = getLightRpc();

    console.log("getting blockhash...");
    const {
      context: { slot: minContextSlot },
      value: blockhashCtx,
    } = await lightRpc.getLatestBlockhashAndContext();

    console.log("creating decompress token instructions...");
    const { instructions } = await createDecompressTokenIx({
      owner: connectedWallet,
      mint,
      amount,
    });

    console.log("building txn...");
    const transaction = getTxnForSigning(
      instructions,
      connectedWallet,
      blockhashCtx.blockhash,
    );

    console.log("sending tx for signing...");
    const signature = await sendTransaction(transaction, lightRpc, {
      minContextSlot,
    });

    console.log("confirming tx...");
    await lightRpc.confirmTransaction({
      blockhash: blockhashCtx.blockhash,
      lastValidBlockHeight: blockhashCtx.lastValidBlockHeight,
      signature,
    });

    console.log("tx confirmed", signature);
    return {
      txnSignature: signature,
    };
  };

  return (
    <ZKCompressionContext.Provider
      value={{
        lightRpc: getLightRpc(),
        createMint,
        mintTokens,
        transferTokens,
        compressToken,
        descompressToken,
        reclaimRent,
        compressAndReclaimRent,
      }}
    >
      {children}
    </ZKCompressionContext.Provider>
  );
}

// Create a custom hook to use the context
export function useZKCompression() {
  const context = useContext(ZKCompressionContext);
  if (context === undefined) {
    throw new Error(
      "useZKCompression must be used within a ZKCompressionProvider",
    );
  }
  return context;
}
