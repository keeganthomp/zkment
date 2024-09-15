export const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY as string;

export const HELIUS_BASE_URL = "https://devnet.helius-rpc.com";

export const HELIUS_TESTNET_RPC = `${HELIUS_BASE_URL}?api-key=${HELIUS_API_KEY}`;
