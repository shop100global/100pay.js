type CurrencyConversionPayload = {
  amount: number;
  from_symbol: string;
  to_symbol: string;
  appId?: string;
  mode?: string;
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

export { CurrencyConversionPayload, CurrencyConversionResult };
