import { createRpc as createLightRpc } from "@lightprotocol/stateless.js";
import {
  ComputeBudgetProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
  // AddressLookupTableAccount,
  Signer,
} from "@solana/web3.js";
import {
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  getMintLen,
  MINT_SIZE,
} from "@solana/spl-token";
import { pack, TokenMetadata } from "@solana/spl-token-metadata";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { IDL } from "@lightprotocol/compressed-token";
import { getRpcUrl } from "@/utils/environment";
import { getMint } from "@solana/spl-token";

export const ZK_NETWORK_RPC_TESTNET = getRpcUrl();
export const PHOTON_RPC_ENDPOINT_TESTNET = getRpcUrl();

export const DEFAULT_PRIORITY_FEE = 1_000_000;

export const COMPRESSED_TOKEN_PROGRAM_ID = new PublicKey(
  "cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m"
);
export const CPI_AUTHORITY_SEED = Buffer.from("cpi_authority");
export const POOL_SEED = Buffer.from("pool");

export type CompressedTokenDetails = {
  account: {
    hash?: string;
    lamports?: number;
    leafIndex?: number;
    owner?: string;
    seq?: number;
    slotCreated?: number;
    tree?: string;
    decimals?: number;
    balance?: number;
    data?: {
      data: string;
      dataHash: string;
      discriminator: number;
    };
  };
  token: {
    mint: PublicKey;
    decimals: number;
    mintAuthority?: PublicKey | null;
    freezeAuthority?: PublicKey | null;
  };
};

export const getLightRpc = () => {
  return createLightRpc(ZK_NETWORK_RPC_TESTNET, PHOTON_RPC_ENDPOINT_TESTNET);
};

export const getTxnForSigning = (
  txnInstructions: TransactionInstruction | TransactionInstruction[],
  signer: PublicKey,
  blockhash: string,
  additionalSigners?: Signer[]
  // lookupTableAccounts?: AddressLookupTableAccount[]
): VersionedTransaction => {
  const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: DEFAULT_PRIORITY_FEE,
  });
  const instructions = [computeUnitLimitIx];
  if (Array.isArray(txnInstructions)) {
    instructions.push(...txnInstructions);
  } else {
    instructions.push(txnInstructions);
  }
  const messageV0 = new TransactionMessage({
    payerKey: signer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);
  if (additionalSigners && additionalSigners.length > 0) {
    transaction.sign(additionalSigners);
  }
  return transaction;
};

export const getMintRentExemption = async (metaData?: TokenMetadata) => {
  const lightRpc = getLightRpc();

  let dataLength = MINT_SIZE;
  if (metaData) {
    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    // Size of metadata
    const metadataLen = pack(metaData).length;
    // Size of Mint Account with extension
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    dataLength += metadataExtension + metadataLen + mintLen;
  }

  const rentExemptBalance =
    await lightRpc.getMinimumBalanceForRentExemption(dataLength);
  return rentExemptBalance;
};

export const deriveTokenPoolPda = (mint: PublicKey): PublicKey => {
  const POOL_SEED = Buffer.from("pool");
  const seeds = [POOL_SEED, mint.toBuffer()];
  const [address, _] = PublicKey.findProgramAddressSync(
    seeds,
    COMPRESSED_TOKEN_PROGRAM_ID
  );
  return address;
};

export const deriveCpiAuthorityPda = (): PublicKey => {
  const [address, _] = PublicKey.findProgramAddressSync(
    [CPI_AUTHORITY_SEED],
    COMPRESSED_TOKEN_PROGRAM_ID
  );
  return address;
};

export const getCompressedMintProgam = (connectedWallet: PublicKey) => {
  const lightRpc = getLightRpc();
  // @ts-ignore
  const provider = new AnchorProvider(lightRpc, connectedWallet, {
    commitment: "confirmed",
  });
  // @ts-ignore
  return new Program(IDL, COMPRESSED_TOKEN_PROGRAM_ID, provider);
};

export const getCompressedMintInfo = async ({
  // owner,
  mint,
}: {
  // owner: PublicKey;
  mint: PublicKey;
}): Promise<CompressedTokenDetails> => {
  const lightRpc = getLightRpc();
  // fetch compressed account from helius
  const compressedAccountResponse = await fetch(getRpcUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "get-compressed-account",
      method: "getCompressedAccount",
      params: {
        address: mint?.toBase58(),
      },
    }),
  });
  const compressedAccountResponseData = await compressedAccountResponse.json();
  const compressedAccountInfo = compressedAccountResponseData?.result?.value;
  // fetch mint info from solana
  const mintInfo = await getMint(lightRpc, mint);
  const formattedCompressedAccountInfo: CompressedTokenDetails = {
    account: {
      hash: compressedAccountInfo?.hash,
      lamports: compressedAccountInfo?.lamports,
      leafIndex: compressedAccountInfo?.leafIndex,
      owner: compressedAccountInfo?.owner,
      seq: compressedAccountInfo?.seq,
      slotCreated: compressedAccountInfo?.slotCreated,
      tree: compressedAccountInfo?.tree,
      data: {
        data: compressedAccountInfo?.data?.data,
        dataHash: compressedAccountInfo?.data?.dataHash,
        discriminator: compressedAccountInfo?.data?.discriminator,
      },
    },
    token: {
      mint: mintInfo?.address,
      decimals: mintInfo?.decimals,
      mintAuthority: mintInfo?.mintAuthority,
      freezeAuthority: mintInfo?.freezeAuthority,
    },
  };
  return formattedCompressedAccountInfo;
};

export const fetCompressedTokenBalances = async (wallet: PublicKey, mint?: string) => {
  const response = await fetch(getRpcUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "compressed-token-balances",
      method: "getCompressedTokenBalancesByOwner",
      params: {
        owner: wallet.toBase58(),
        mint: mint || null
      },
    }),
  });

  if (response.status === 429) {
    throw new Error("Too many requests. Try again in a few seconds.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch compressed token balances");
  }

  const data = await response.json();
  const compressedTokenBalances = data?.result?.value?.token_balances;

  if (!compressedTokenBalances) {
    return [];
  }

  const compressedTokens = compressedTokenBalances.map((token: any) => ({
    mint: token.mint,
    balance: Number(token.balance), // Ensure balance is a number for accurate sorting
    compressed: true,
  }));

  // Sort by balance descending, then by mint address ascending
  compressedTokens.sort((a: any, b: any) => {
    if (b.balance !== a.balance) {
      return b.balance - a.balance; // Primary sort: balance descending
    }
    // Secondary sort: mint address ascending
    return a.mint.localeCompare(b.mint);
  });

  return compressedTokens;
};

export const fetchCompressedSignatures = async (wallet: PublicKey) => {
  const lightRpc = getLightRpc();
  const compressedSignatures =
    await lightRpc.getCompressionSignaturesForOwner(wallet);
  console.log("compressedSignatures", compressedSignatures);
};
