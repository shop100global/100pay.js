type CurrencyConversionPayload = {
  amount: number;
  fromSymbol: string;
  toSymbol: string;
  appId?: string;
};

type CurrencyConversionResult = {
  convertedAmount: number;
  totalAmount: number;
  feeInUSD: number;
  feeInToCurrency: number;
  feeInfromSymbol: number;
  conversionFeeInUSD: number;
  conversionFeeInToCurrency: number;
  conversionFeeInfromSymbol: number;
  fromRate: number;
  toRate: number;
  intermediateUSDAmount: number;
};

export { CurrencyConversionPayload, CurrencyConversionResult };
