/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
type CurrencyConversionPayload = Record<string, unknown> & {
  amount: number;
  from_symbol?: string;
  to_symbol?: string;
  appId?: string;
  mode?: string;

  // for backwards compatibility
  fromSymbol?: string;
  toSymbol?: string;
};

type EnhancedConversionResponse = {
  conversion: {
    fromSymbol: string;
    toSymbol: string;
    requestedAmount: number;
    convertedAmount: number;
    feeInFromCurrency: number;
    feeInToCurrency: number;
    totalDebitAmount: number;
    totalAmount: number;
    finalAmount: number;
    feeInUSD: number;
    conversionFeeInUSD: number;
    conversionFeeInToCurrency: number;
    conversionFeeInFromCurrency: number;
    fromRate: number;
    toRate: number;
    intermediateUSDAmount: number;
    percentageConversionFee: number;
  };
  balance: {
    currentBalance: number;
    availableBalance: number;
    hasSufficientBalance: boolean;
    shortfall: number;
  };
  wallets: {
    fromWallet: {
      exists: boolean;
      symbol: string;
      walletType: "crypto" | "local" | string;
    };
    toWallet: {
      exists: boolean;
      symbol: string;
      walletType: "crypto" | "local" | string;
    };
  };
  canProceed: boolean;
  restrictions: {
    isWhitelisted: boolean;
    validationPassed: boolean;
    additionalValidations: {
      [key: string]: {
        allowed: boolean;
        message: string;
      } | null;
    };
  };
  user: {
    status: string;
    canTransact: boolean;
  };
  mode: string;
  timestamp: string; // ISO string format
};

type CurrencyConversionResult = {
  convertedAmount: number;
  totalAmount: number;
  finalAmount: number;
  feeInUSD: number;
  feeInToCurrency: number;
  feeInFromCurrency: number;
  conversionFeeInUSD: number;
  conversionFeeInToCurrency: number;
  conversionFeeInFromCurrency: number;
  fromRate: number;
  toRate: number;
  intermediateUSDAmount: number;
  percentageConversionFee: number;
};

export {
  CurrencyConversionPayload,
  CurrencyConversionResult,
  EnhancedConversionResponse,
};
