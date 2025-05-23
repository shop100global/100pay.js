import { ITransactionData } from "..";

export type Network =
  | "bsc"
  | "sol"
  | "tron"
  | "ethereum"
  | "bitcoin"
  | "polygon";

export interface IWalletFee {
  transfer: number;
  convert: number;
}

export interface IWalletBalance {
  available: string;
  locked: string;
}

export interface IWalletAccount {
  address: string;
}

export interface ISupportedWallet {
  name: string;
  symbol: string;
  decimals?: string | number;
  networks: Network[];
  hotwallet: string;
  balance: IWalletBalance;
  account: IWalletAccount;
  fee: IWalletFee;
  contractAddress?: string;
  contract?: string;
  logo: string;
}

export interface ISupportedWalletResponse {
  statusCode: number;
  message: string;
  data: ISupportedWallet[];
}

/**
 * Standardized response interface for transaction verification
 * @property status - Result status ('success' or 'error')
 * @property data - Transaction details when successful, empty object on failure
 * @property message - Optional response message, typically present on errors
 */
export interface IVerifyResponse {
  status: "success" | "error";
  data: ITransactionData | Record<string, never>;
  message?: string;
}
