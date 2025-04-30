// src/types/transfer.ts

/**
 * Input data for transferring assets between wallets
 */
export interface ITransferAssetData extends Record<string, unknown> {
  /** Amount to transfer (must be greater than zero) */
  amount: number | string;
  /** Asset symbol/currency code to transfer */
  symbol: string;
  /** Destination address or account identifier */
  to: string;
  /** Type of transfer - internal or external */
  transferType?: "internal" | "external";
  /** Optional note or memo for the transfer */
  note?: string;
}

/**
 * Response data for a successful transfer operation
 */
export interface ITransferAssetResponse {
  /** Status code of the response */
  statusCode: number;
  /** Success message */
  message: string;
  /** Transfer details and receipt */
  data: {
    /** Transaction receipt/confirmation */
    receipt: string;
    /** Unique transaction identifier */
    transactionId: string;
    /** Timestamp of when the transaction was processed */
    timestamp: string | number;
  };
}

/**
 * Parameters for retrieving transfer history
 */
export interface ITransferHistoryParams extends Record<string, unknown> {
  /** Optional identifier for the wallet to filter transfers */
  accountIds?: string[];
  /** Optional account address to filter transfers */
  addresses?: string[];
  /** Optional currency symbol to filter transfers */
  symbol?: string;
  /** Page number for pagination */
  page?: number;
  /** Number of records per page */
  limit?: number;
  /** Optional transfer type filter */
  type?: string;
}

/**
 * Individual transfer history item
 */
export interface ITransferHistoryItem {
  /** Unique identifier for the transfer */
  id: string;
  /** Amount that was transferred */
  amount: string | number;
  /** Currency symbol of the transfer */
  symbol: string;
  /** Source address/account */
  from: string;
  /** Destination address/account */
  to: string;
  /** Status of the transfer (completed, pending, failed) */
  status: string;
  /** Timestamp of the transfer */
  timestamp: string | number;
  /** Type of transfer (internal, external) */
  type: string;
  /** Optional transaction note */
  note?: string;
  /** Transaction hash or reference */
  hash?: string;
}

/**
 * Response data for transfer history query
 */
export interface ITransferHistoryResponse {
  /** Status code of the response */
  statusCode: number;
  /** Success message */
  message: string;
  /** List of transfer records */
  data: ITransferHistoryItem[];
  /** Pagination metadata */
  meta: {
    /** Total number of records available */
    total: number;
    /** Current page number */
    page: number;
    /** Records per page */
    limit: number;
    /** Total number of pages */
    pages: number;
  };
}

/**
 * Parameters for calculating transfer fees
 */
export interface ITransferFeeParams extends Record<string, unknown> {
  /** Currency symbol to calculate fees for */
  symbol: string;
  /** Type of transfer - internal or external */
  transferType?: "internal" | "external";
}

/**
 * Response data for fee calculation
 */
export interface ITransferFeeResponse {
  /** Status code of the response */
  statusCode: number;
  /** Success message */
  message: string;
  /** Fee details */
  data: {
    /** Base fee amount */
    baseFee: string | number;
    /** Network fee (for blockchain transfers) */
    networkFee?: string | number;
    /** Total fee to be paid */
    totalFee: string | number;
    /** Currency symbol of the fee */
    feeSymbol: string;
    /** Current network congestion level (if applicable) */
    networkCongestion?: "low" | "medium" | "high";
  };
}
