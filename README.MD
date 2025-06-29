# 100Pay SDK

A TypeScript library for integrating with the 100Pay payment platform, enabling developers to easily accept cryptocurrency payments, manage transactions, and perform bank transfers.

## Features

- ✅ Verify cryptocurrency payments
- ✅ Create and manage subaccounts
- ✅ Preview currency conversions
- ✅ Transfer assets between wallets
- ✅ Get supported wallets
- ✅ Bank transfers with account verification
- ✅ Make authenticated API requests
- ✅ Full TypeScript support with comprehensive typing
- ✅ Secure server-to-server communication with request signing

## Installation

```bash
npm install @100pay-hq/100pay.js
```

Or using yarn:

```bash
yarn add @100pay-hq/100pay.js
```

## Quick Start

```typescript
import { Pay100 } from '@100pay-hq/100pay.js';

// Initialize the 100Pay client
const client = new Pay100({
  publicKey: 'your_public_key',
  secretKey: 'your_secret_key' // Required for server-side operations
});

// Verify a transaction
async function verifyTransaction(transactionId) {
  try {
    const result = await client.verify(transactionId);
    
    if (result.status === 'success') {
      console.log('Transaction verified:', result.data);
      return result.data;
    } else {
      console.error('Verification failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}
```

## API Reference

### Initialization

```typescript
const client = new Pay100({
  publicKey: string,  // Your 100Pay public API key (required)
  secretKey?: string, // Your 100Pay secret API key (required for server-side operations)
  baseUrl?: string    // Optional custom API base URL (defaults to https://api.100pay.co)
});
```

### Transaction Verification

```typescript
// Verify a crypto payment transaction
const result = await client.verify(transactionId);
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| transactionId | string | The unique ID of the transaction to verify |

**Returns:**

```typescript
interface IVerifyResponse {
  status: "success" | "error";
  data: ITransactionData | Record<string, never>;
  message?: string;
}
```

**Example:**

```typescript
try {
  const result = await client.verify("tx_123456789");
  
  if (result.status === 'success') {
    // Payment is valid
    const { amount, currency, status } = result.data;
    // Process order fulfillment
  } else {
    // Payment verification failed
    console.error(result.message);
  }
} catch (error) {
  // Handle verification error
  if (error instanceof PaymentVerificationError) {
    console.error(`Payment verification failed: ${error.message}`);
  }
}
```

### Subaccounts

Subaccounts allow you to create and manage separate accounts under your main account.

```typescript
// Create a subaccount
const subaccount = await client.subaccounts.create({
  symbols: ["BTC", "ETH", "USDT"],
  networks: ["ETHEREUM", "BSC"],
  owner: {
    name: "Partner Store",
    email: "partner@example.com",
    phone: "+1234567890"
  },
  metadata: {
    storeId: "store-123",
    region: "US"
  }
});
```

**Parameters:**

```typescript
interface CreateSubAccountData {
  symbols: string[];            // List of supported cryptocurrencies
  networks: string[];           // List of supported blockchain networks
  owner: {
    name: string;               // Owner's name
    email: string;              // Owner's email
    phone: string;              // Owner's phone number
  };
  metadata: Record<string, unknown>; // Custom metadata for the subaccount
}
```

**Returns:**

```typescript
interface CreateSubAccountResponse {
  message: string;
  accounts: Account[];
}

interface Account {
  balance: {
    available: number | null;
    locked: number | null;
  };
  accountType: string;         // e.g. "subaccount"
  walletType: string;          // e.g. "crypto"
  status: string;              // e.g. "active"
  _id: string;
  name: string;                // e.g. "Tether USDT"
  symbol: string;              // e.g. "USDT"
  decimals: string;            // e.g. "18"
  account: AccountDetails;
  contractAddress: string;
  logo: string;
  userId: string;
  appId: string;
  network: string;
  ownerId: string;
  parentWallet: string;
  __v: number;
}

interface AccountDetails {
  address: string;
  key: Key;
  network: string;
}

interface Key {
  version: number;
  id: string;
  address: string;
  crypto: Crypto;
}

interface Crypto {
  ciphertext: string;
  cipherparams: {
    iv: string;
  };
  cipher: string;
  kdf: string;
  kdfparams: {
    dklen: number;
    salt: string;
    n: number;
    r: number;
    p: number;
  };
  mac: string;
}
```

**Example:**

```typescript
try {
  const result = await client.subaccounts.create({
    symbols: ["USDT", "BTC"], 
    networks: ["ETHEREUM"],
    owner: {
      name: "Merchant Store",
      email: "merchant@example.com",
      phone: "+1234567890"
    },
    metadata: {
      businessType: "ecommerce"
    }
  });
  
  console.log(`Created ${result.accounts.length} accounts for the subaccount`);
  // Store wallet addresses for each account
  result.accounts.forEach(account => {
    console.log(`${account.symbol} wallet: ${account.account.address}`);
  });
} catch (error) {
  console.error(`Failed to create subaccount: ${error.message}`);
}
```

### Currency Conversion

Preview currency conversion rates and fees:

```typescript
// Preview a currency conversion
const conversion = await client.conversion.preview({
  amount: 100,
  fromSymbol: "BTC",
  toSymbol: "USDT",
  appId: "your_app_id" // Optional
});
```

**Parameters:**

```typescript
interface CurrencyConversionPayload {
  amount: number;      // Amount to convert
  fromSymbol: string;  // Source currency symbol
  toSymbol: string;    // Target currency symbol
  appId?: string;      // Optional application ID
}
```

**Returns:**

```typescript
interface CurrencyConversionResult {
  convertedAmount: number;              // Final amount after conversion
  totalAmount: number;                  // Total amount including fees
  feeInUSD: number;                     // Fee amount in USD
  feeInToCurrency: number;              // Fee amount in target currency
  feeInfromSymbol: number;              // Fee amount in source currency
  conversionFeeInUSD: number;           // Conversion fee in USD
  conversionFeeInToCurrency: number;    // Conversion fee in target currency
  conversionFeeInfromSymbol: number;    // Conversion fee in source currency
  fromRate: number;                     // Exchange rate for source currency
  toRate: number;                       // Exchange rate for target currency
  intermediateUSDAmount: number;        // Intermediate amount in USD
}
```

**Example:**

```typescript
try {
  const preview = await client.conversion.preview({
    amount: 0.5,
    fromSymbol: "BTC",
    toSymbol: "USDT"
  });
  
  console.log(`Converting 0.5 BTC to USDT:`);
  console.log(`You will receive: ${preview.convertedAmount} USDT`);
  console.log(`Exchange rate: 1 BTC = ${preview.toRate / preview.fromRate} USDT`);
  console.log(`Total fees: ${preview.feeInUSD} USD (${preview.feeInfromSymbol} BTC)`);
} catch (error) {
  console.error(`Conversion preview failed: ${error.message}`);
}
```

### Asset Transfers

Transfer assets between wallets and manage transfer operations:

```typescript
// Execute an asset transfer
const transfer = await client.transfer.executeTransfer({
  amount: 100,
  currency: "USDT",
  recipientAddress: "0x1234567890abcdef...",
  // ... other transfer parameters
});

// Get transfer history
const history = await client.transfer.getHistory({
  page: 1,
  limit: 10
});

// Calculate transfer fees
const fees = await client.transfer.calculateFee({
  currency: "USDT",
  transferType: "crypto"
});
```

### Wallet Operations

Get information about supported wallets:

```typescript
// Get supported wallets
const wallets = await client.wallet.getSupportedWallets();
console.log(`Supported wallets:`, wallets);
```

### Bank Transfers

The SDK now supports bank transfer operations including getting bank lists, verifying accounts, and executing transfers:

```typescript
// Get list of supported banks
const bankList = await client.bankTransfer.getBankList();
console.log(`${bankList.data.count} banks available`);

// Verify a bank account
const verification = await client.bankTransfer.verifyBank({
  bankCode: "044",
  accountNumber: "1234567890"
});

if (verification.data.verified) {
  console.log(`Account verified: ${verification.data.accountName}`);
  
  // Execute bank transfer
  const transfer = await client.bankTransfer.transfer({
    beneficiaryBankCode: "044",
    beneficiaryAccountNumber: "1234567890",
    beneficiaryAccountName: "John Doe",
    amount: 500, // Amount in Naira (NGN 500)
    narration: "Payment for services",
    paymentReference: `ref_${Date.now()}`,
    saveBeneficiary: true
  });
  
  console.log(`Transfer initiated: ${transfer.data.transfer.sessionId}`);
}
```

**Bank Transfer Methods:**

#### Get Bank List

```typescript
const banks = await client.bankTransfer.getBankList();
```

**Returns:**

```typescript
interface IBankListResponse {
  statusCode: number;
  message: string;
  data: {
    banks: IBank[];
    count: number;
  };
}

interface IBank {
  name?: string;
  alias?: string[];
  routingKey?: string;
  logoImage?: string | null;
  bankCode?: string;
  categoryId?: string;
  nubanCode?: string | null;
}
```

#### Verify Bank Account

```typescript
const verification = await client.bankTransfer.verifyBank({
  bankCode: "044",
  accountNumber: "1234567890"
});
```

**Parameters:**

```typescript
interface IVerifyBankData {
  bankCode: string;      // Bank code from the bank list
  accountNumber: string; // Account number to verify
}
```

**Returns:**

```typescript
interface IVerifyBankResponse {
  statusCode: number;
  message: string;
  data: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    verified: boolean;
  };
}
```

#### Execute Bank Transfer

```typescript
const transfer = await client.bankTransfer.transfer({
  beneficiaryBankCode: "044",
  beneficiaryAccountNumber: "1234567890",
  beneficiaryAccountName: "John Doe",
  amount: 50000,
  narration: "Payment description",
  paymentReference: "unique_ref_123",
  saveBeneficiary: true
});
```

**Parameters:**

```typescript
interface IBankTransferData {
  beneficiaryBankCode: string;      // Recipient's bank code
  beneficiaryAccountNumber: string; // Recipient's account number
  beneficiaryAccountName: string;   // Recipient's account name
  amount: number;                   // Amount in Naira
  narration: string;                // Transfer description
  paymentReference: string;         // Unique payment reference
  saveBeneficiary: boolean;         // Whether to save this beneficiary
}
```

**Returns:**

```typescript
interface IBankTransferResponse {
  statusCode: number;
  message: string;
  data: {
    transfer: {
      sessionId: string;
      status: string;
      amount: number;
      beneficiaryAccountNumber: string;
      beneficiaryBankCode: string;
      paymentReference: string;
      narration: string;
      createdAt: string;
    };
  };
}
```

### Generic API Requests

The SDK provides a generic `request` method for making any API call to the 100Pay API:

```typescript
const response = await client.request<ResponseType>(
  method,   // 'GET', 'POST', 'PUT', or 'DELETE'
  endpoint, // API endpoint path
  data      // Request payload
);
```

**Example:**

```typescript
// Get user balance
const balance = await client.request<BalanceResponse>(
  'GET',
  '/api/v1/user/balance'
);
```

## Error Handling

The SDK provides typed error handling:

```typescript
try {
  const result = await client.verify(transactionId);
  // Process result
} catch (error) {
  if (error instanceof PaymentVerificationError) {
    // Handle payment verification specific error
    console.error(`Payment verification failed: ${error.message}`);
  } else if (error instanceof Error) {
    // Handle general error
    console.error(`API error: ${error.message}`);
  }
}
```

## Security and Authentication

This SDK implements secure authentication with 100Pay using API keys and request signing for server-to-server communications:

1. Each request is signed with HMAC SHA-256 using your secret key
2. Signatures include a timestamp to prevent replay attacks
3. All requests include your public API key for identification

Client-side operations can use public key only, while server-side operations require both public and secret keys.

## TypeScript Support

This package is built with TypeScript and includes full type definitions. The main types are exported for your convenience:

```typescript
import { 
  Pay100, 
  PaymentVerificationError, 
  CreateSubAccountData,
  CurrencyConversionPayload,
  CurrencyConversionResult,
  Account,
  AccountDetails,
  IBankListResponse,
  IBankTransferData,
  IBankTransferResponse,
  IVerifyBankData,
  IVerifyBankResponse
} from '@100pay-hq/100pay.js';
```

## Common Use Cases

### Accepting Cryptocurrency Payments

1. Initialize the SDK with your API keys
2. When a payment is received, use the `verify` method to confirm the transaction
3. Process the order or service based on the verification result

### Creating Subaccounts for Partners or Marketplaces

```typescript
const subaccount = await client.subaccounts.create({
  symbols: ["BTC", "ETH", "USDT"],
  networks: ["ETHEREUM"],
  owner: {
    name: "Partner Name",
    email: "partner@example.com",
    phone: "+1234567890"
  },
  metadata: {
    partnerId: "partner-123"
  }
});

// Save the subaccount information for future use
console.log(`Created subaccount with ${subaccount.accounts.length} wallets`);
subaccount.accounts.forEach(account => {
  console.log(`${account.symbol} wallet: ${account.account.address}`);
});
```

### Currency Conversion Preview

```typescript
// Get conversion rates before executing a trade
const preview = await client.conversion.preview({
  amount: 1000,
  fromSymbol: "USDT",
  toSymbol: "BTC"
});

// Show user the conversion details
console.log(`You will receive approximately ${preview.convertedAmount} BTC`);
console.log(`Exchange rate: 1 USDT = ${preview.toRate / preview.fromRate} BTC`);
console.log(`Fee: ${preview.feeInfromSymbol} USDT (${preview.feeInUSD} USD)`);
```

### Bank Transfer Workflow

```typescript
// Complete bank transfer workflow
async function performBankTransfer() {
  try {
    // 1. Get available banks
    const banks = await client.bankTransfer.getBankList();
    console.log(`Available banks: ${banks.data.count}`);
    
    // 2. Find the desired bank
    const targetBank = banks.data.banks.find(bank => bank.name?.includes("Access"));
    if (!targetBank) throw new Error("Bank not found");
    
    // 3. Verify the recipient's account
    const verification = await client.bankTransfer.verifyBank({
      bankCode: targetBank.bankCode!,
      accountNumber: "1234567890"
    });
    
    if (!verification.data.verified) {
      throw new Error("Account verification failed");
    }
    
    console.log(`Account verified: ${verification.data.accountName}`);
    
    // 4. Execute the transfer
    const transfer = await client.bankTransfer.transfer({
      beneficiaryBankCode: targetBank.bankCode!,
      beneficiaryAccountNumber: "1234567890",
      beneficiaryAccountName: verification.data.accountName,
      amount: 500, // NGN 500 in Naira
      narration: "Payment for services rendered",
      paymentReference: `PAY_${Date.now()}`,
      saveBeneficiary: true
    });
    
    console.log(`Transfer successful: ${transfer.data.transfer.sessionId}`);
    return transfer.data.transfer;
    
  } catch (error) {
    console.error(`Bank transfer failed: ${error.message}`);
    throw error;
  }
}
```

## Resources

- [100Pay Platform](https://100pay.co)
- [100Developers Portal](https://100pay.co) - Get your API keys here
- [API Documentation](https://documenter.getpostman.com/view/13045730/2s93RMUatE)

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/shop100global/100pay.js.git
cd 100pay.js

# Install dependencies
npm install

# Build the project
npm run build
```

### Available Scripts

- `npm run build` - Build the TypeScript code
- `npm run build:clean` - Clean the dist directory and build
- `npm run test` - Run tests
- `npm run lint` - Lint the code
- `npm run lint:fix` - Lint and fix code

## License

[MIT License](LICENSE.md)
