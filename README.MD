# 100Pay SDK

A TypeScript library for integrating with the 100Pay payment platform, enabling developers to easily accept cryptocurrency payments.

## Features

- ✅ Verify cryptocurrency payments
- ✅ Create and manage subaccounts
- ✅ Make cryptocurrency transfers
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
  secretKey: 'your_secret_key'
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
  baseUrl?: string    // Optional custom API base URL
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

### Generic API Requests

The SDK provides a generic `request` method for making any API call to the 100Pay API:

```typescript
const response = await client.request<ResponseType>(
  method,   // 'GET', 'POST', 'PUT', or 'DELETE'
  endpoint, // API endpoint path
  data      // Request payload
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

This SDK implements secure authentication with 100Pay using API keys and request signing for server-to-server communications. All requests that require authentication automatically include the necessary headers with timestamps and signatures.

## TypeScript Support

This package is built with TypeScript and includes full type definitions. The main types are exported for your convenience:

```typescript
import { Pay100, PaymentVerificationError, CreateSubAccountData } from '@100pay-hq/100pay.js';
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

## Migration from JavaScript Version

The TypeScript version includes some improvements over the original JavaScript version:

1. Uses `axios` instead of the deprecated `request` library
2. Better error handling with typed errors
3. Stricter type checking for method parameters and return values
4. Object-based constructor for better flexibility

If you're migrating from the JavaScript version, note that the constructor now requires an object parameter rather than individual arguments.

## License

[MIT License](LICENSE).
