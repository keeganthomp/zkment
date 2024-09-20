// Environment.ts
export enum Environment {
  LOCAL = "local",
  DEVNET = "devnet",
  MAINNET = "mainnet",
}

const defaultEnvironment = Environment.DEVNET;
const ENV_STORAGE_KEY = "NETWORK";

/**
 * Retrieves the environment from localStorage.
 * Falls back to the default environment if not set or invalid.
 */
export const getEnvironment = (): Environment => {
  const storedEnv = localStorage.getItem(ENV_STORAGE_KEY);
  if (
    storedEnv &&
    Object.values(Environment).includes(storedEnv as Environment)
  ) {
    return storedEnv as Environment;
  }
  return defaultEnvironment;
};

/**
 * Sets the environment in localStorage.
 * @param env - The environment to set.
 */
export const setEnvironment = (env: Environment): void => {
  if (Object.values(Environment).includes(env)) {
    const didEnvChange = env !== getEnvironment();
    localStorage.setItem(ENV_STORAGE_KEY, env);
    if (didEnvChange) {
      window.location.reload();
    }
  } else {
    console.warn(`Attempted to set invalid environment: ${env}`);
  }
};

export const getRpcUrl = () => {
  switch (getEnvironment()) {
    case Environment.LOCAL: {
      const rpcUrl = import.meta.env.VITE_LOCAL_RPC || "http://localhost:8899/";
      if (!rpcUrl) {
        throw new Error("LOCAL_RPC is not set");
      }
      return rpcUrl;
    }
    case Environment.DEVNET: {
      const rpcUrl = import.meta.env.VITE_DEVNET_RPC;
      if (!rpcUrl) {
        throw new Error("DEVNET_RPC is not set");
      }
      return rpcUrl;
    }
    case Environment.MAINNET: {
      const rpcUrl = import.meta.env.VITE_MAINNET_RPC;
      if (!rpcUrl) {
        throw new Error("MAINNET_RPC is not set");
      }
      return rpcUrl;
    }
  }
};
