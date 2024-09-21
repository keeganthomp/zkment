import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getMint,
  createCloseAccountInstruction,
} from "@solana/spl-token";
import { getLightRpc } from "@/utils/zkCompression";
import { getRpcUrl, getEnvironment } from "@/utils/environment";

const currentEnv = getEnvironment();

export const formatAddress = (address = "") => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const formatAmount = (
  amount: number = 0,
  decimals: number = 9
): string => {
  // Calculate the formatted value by dividing the amount by 10^decimals
  const value = amount / 10 ** decimals;

  // Define a threshold below which the number will be displayed in exponential notation
  const EXPONENTIAL_THRESHOLD = 1e-6;

  // Check if the absolute value is below the threshold and not zero
  if (Math.abs(value) < EXPONENTIAL_THRESHOLD && value !== 0) {
    // Convert to exponential notation with up to 6 decimal places
    return value.toExponential(6);
  } else {
    // Convert to fixed-point notation with specified decimals
    // Then remove any trailing zeros and the decimal point if not needed
    return parseFloat(value.toFixed(decimals)).toString();
  }
};

export const getAddressExplorerUrl = (address = "") => {
  return currentEnv === "mainnet"
    ? `https://explorer.solana.com/address/${address}`
    : `https://explorer.solana.com/address/${address}?cluster=devnet`;
};

export const getSignatureExplorerUrl = (signature = "") => {
  return currentEnv === "mainnet"
    ? `https://explorer.solana.com/tx/${signature}`
    : `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
};

export const openExplorerUrl = (address = "", isTxn = false) => {
  window.open(
    isTxn ? getSignatureExplorerUrl(address) : getAddressExplorerUrl(address),
    "_blank"
  );
};

export type TokenAccount = {
  address: string;
  amount: number;
  delegated_amount: number;
  frozen: boolean;
  mint: string;
  owner: string;
};

export const getAssociatedTokenAddress = ({
  owner,
  mint,
}: {
  owner: PublicKey;
  mint: PublicKey;
}) => {
  // Check if the ATA already exists
  const existingATA = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
  if (existingATA) {
    return existingATA;
  }
};

export const checkIfAtaExist = async ({
  owner,
  mint,
}: {
  owner: PublicKey;
  mint: PublicKey;
}) => {
  const lightRpc = getLightRpc();

  let ata = getAssociatedTokenAddress({
    owner,
    mint,
  });
  // check if originalAta is valid
  let hasAta = false;
  if (ata) {
    try {
      await getAccount(lightRpc, ata);
      hasAta = true;
    } catch (error: any) {
      // we assume the ata is not valid if we get an error
      // create the ata here
      console.log(
        `No ATA found for ${mint.toBase58()} owned by ${owner.toBase58()}`
      );
    }
  }
  return { ata: ata as PublicKey, isValid: hasAta };
};

export const checkIfAccountExist = async (account: PublicKey) => {
  const lightRpc = getLightRpc();

  let accountExist = false;
  if (account) {
    try {
      await getAccount(lightRpc, account);
      accountExist = true;
    } catch (error: any) {
      // we assume the ata is not valid if we get an error
      // create the ata here
      console.log(`Error getting account ${account.toBase58()}:`, error);
    }
  }
  return accountExist;
};

export const fetchSplTokenAccounts = async (
  walletAddress: PublicKey
): Promise<TokenAccount[]> => {
  const response = await fetch(getRpcUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "getTokenAccounts",
      id: "token-accounts",
      params: {
        page: 1,
        limit: 100,
        displayOptions: {
          showZeroBalance: true,
        },
        owner: walletAddress.toBase58(),
      },
    }),
  });
  if (response.status === 429) {
    throw new Error("Too many requests. Try again in a few seconds.");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch compressed token balances");
  }
  const { result } = await response.json();
  return result?.token_accounts || [];
};

export const getSolBalance = async (
  connection: Connection,
  walletAddress: PublicKey
) => {
  const solBalance = await connection.getBalance(walletAddress);
  return solBalance / LAMPORTS_PER_SOL;
};

export const createCloseAccountIx = async ({
  ata,
  owner,
}: {
  ata: string;
  owner: string;
}) => {
  return createCloseAccountInstruction(
    new PublicKey(ata),
    new PublicKey(owner),
    new PublicKey(owner)
  );
};

export const getAccountRentBalance = async (
  connection: Connection,
  account: PublicKey
) => {
  try {
    const fetchedAccount = await getAccount(connection, account);
    console.log("fetchedAccount", fetchedAccount);
    const rentReserve = fetchedAccount.rentExemptReserve;
    console.log("rentReserve", rentReserve);
    if (!rentReserve) return 0;
  } catch (err) {
    console.log("Error fetching account to check rent reserve", err);
    return 0;
  }
};

export const getTransactions = async (account: PublicKey): Promise<any[]> => {
  const response = await fetch(getRpcUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "getSignaturesForAddress",
      id: "wallet-sigs",
      params: [account.toBase58()],
    }),
  });
  if (response.status === 429) {
    throw new Error("Too many requests. Try again in a few seconds.");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch compressed token balances");
  }
  const transactions = await response.json();
  return transactions?.result || [];
};

export const getMintInfo = async (connection: Connection, account: string) => {
  const mint = await getMint(connection, new PublicKey(account));
  return mint;
};
