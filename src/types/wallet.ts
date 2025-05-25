// import { ITransactionData } from "..";

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

export interface IChargeData {
  retries: number;
  acknowledged: boolean;
  dispatched: boolean;
  type: string;
  _id: string;
  chargeId: string;
  reference: string;
  data: {
    from: string;
    to: string;
    network: string;
    transaction_id: string;
    status: string;
    timestamp: string;
    value: {
      local: {
        amount: string;
        currency: string;
      };
      crypto: {
        amount: number;
        currency: string;
      };
    };
    block: {
      height: number;
      hash: string;
    };
    charge: {
      customer: {
        user_id: string;
        name: string;
        email: string;
        phone: string;
      };
      billing: {
        currency: string;
        vat: number;
        pricing_type: string;
        amount: string;
        description: string;
      };
      status: {
        context: {
          status: string;
          value: number;
        };
        value: string;
        total_paid: number;
      };
      ref_id: string;
      payments: Array<{
        from: string;
        to: string;
        network: string;
        transaction_id: string;
        status: string;
        timestamp: string;
        value: {
          local: {
            amount: string;
            currency: string;
          };
          crypto: {
            amount: number;
            currency: string;
          };
        };
        block: {
          height: number;
          hash: string;
        };
      }>;
      charge_source: string;
      createdAt: string;
      _id: string;
      metadata: {
        is_approved: string;
        enrollment_id: string;
        skill_id: string;
        user_id: string;
      };
      call_back_url: string;
      app_id: string;
      userId: string;
      chargeId: string;
      __v: number;
    };
    appId: string;
  };
  cryptoChargeId: string;
  createdAt: string;
  __v: number;
}

type DataType = IChargeData & Record<string, unknown>;

/**
 * Standardized response interface for transaction verification
 * @property status - Result status ('success' or 'error')
 * @property data - Transaction details when successful, empty object on failure
 * @property message - Optional response message, typically present on errors
 */
export interface IVerifyResponse {
  status: "success" | "error";
  data?: DataType | null;
  message?: string;
}
