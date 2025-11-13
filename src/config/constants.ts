import { Address } from "viem";

/**
 * Contract Configuration
 * Update this address when the contract is redeployed
 */
export const CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address) ||
  ("0x49fB1E12664C0519bB9611Dc306d4988548acB0B" as Address);

/**
 * Network Configuration
 */
export const SUPPORTED_CHAIN_ID = 84532; // Base Sepolia
export const SUPPORTED_CHAIN_NAME = "baseSepolia";

/**
 * Game Configuration
 */
export const DEFAULT_MOVE_TIMEOUT = 24 * 60 * 60; // 24 hours in seconds
export const MAX_USERNAME_LENGTH = 32;
export const MIN_USERNAME_LENGTH = 1;

/**
 * UI Configuration
 */
export const POLLING_INTERVAL = 5000; // 5 seconds
export const TRANSACTION_TIMEOUT = 120000; // 2 minutes


