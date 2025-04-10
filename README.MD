# 100Pay SDK

A TypeScript library for integrating with the 100Pay payment platform, enabling developers to easily accept cryptocurrency payments and manage transactions.

## Features

- ✅ Verify cryptocurrency payments
- ✅ Create and manage subaccounts
- ✅ Preview currency conversions
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
  name: "Partner Store",
  email: "partner@example.com",
  // Additional properties as needed
});
```

**Parameters:**

```typescript
interface CreateSubAccountData {
  name: string;
  email: string;
  // Additional properties defined in types
}
```

**Returns:**

```typescript
interface CreateSubAccountResponse {
  status: string;
  message: string;
  data: {
    // Subaccount properties
  };
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
  amount: number;
  fromSymbol: string;
  toSymbol: string;
  appId?: string;
}
```

**Returns:**

```typescript
interface CurrencyConversionResult {
  status: string;
  message: string;
  data: {
    // Conversion details including rates and fees
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
  CurrencyConversionPayload 
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
  name: "Partner Name",
  email: "partner@example.com"
});

// Save the subaccount information for future use
console.log(`Created subaccount: ${subaccount.data.id}`);
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
console.log(`You will receive approximately ${preview.data.receivedAmount} ${preview.data.toSymbol}`);
console.log(`Exchange rate: 1 ${preview.data.fromSymbol} = ${preview.data.rate} ${preview.data.toSymbol}`);
console.log(`Fee: ${preview.data.fee} ${preview.data.fromSymbol}`);
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
