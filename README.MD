# 100Pay Checkout

Accept crypto payments on your website in 3 mins

<!--
## ✋ ✋ PACKAGE HAS BEEN DISCONTINUED
## Please 👉 [click here](https://npmjs.com/@100pay-hq/checkout) for the updated package 📦 -->

## Getting Started

Before you can start accepting crypto payments, you need to create a [100pay account](https://100pay.co) and obtain your API keys from the [100Developers platform](https://100pay.co)

For API documentation, please click here 👉 [100Developers API documentation](https://documenter.getpostman.com/view/13045730/2s93RMUatE)

## Features

* Verify Crypto payments
* Bulk Transfers
* Crypto Transfers
* Crypto Payments

## Installation

Install the package using npm:

```bash
npm install @100pay-hq/100pay.js
```

Or using yarn:

```bash
yarn add @100pay-hq/100pay.js
```

## TypeScript Support

This package is fully written in TypeScript and includes type definitions. No additional type packages are required.

## Breaking Changes from JavaScript Version

The TypeScript version includes some breaking changes from the original JavaScript version:

1. The SDK now uses `axios` instead of `request` for HTTP requests
2. Proper error handling with typed errors (`PaymentVerificationError`)
3. Stricter type checking for method parameters and return values
4. Constructor now requires an object with `publicKey` and `secretKey` properties

## Usage

### TypeScript

```typescript
import { _100Pay } from '@100pay-hq/100pay.js';

// Initialize the 100Pay client
const payClient = new _100Pay({
  publicKey: 'your_public_key',
  secretKey: 'your_secret_key'
});

// Verify a transaction
async function verifyTransaction(transactionId: string) {
  try {
    const result = await payClient.verify(transactionId);
    
    if (result.status === 'success') {
      console.log('Transaction verified:', result.data);
      return result.data;
    } else {
      console.error('Verification failed:', result.message);
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    }
    throw error;
  }
}
```

### JavaScript (CommonJS)

```javascript
const { _100Pay } = require('@100pay-hq/100pay.js');

// Initialize the 100Pay client
const payClient = new _100Pay({
  publicKey: 'your_public_key',
  secretKey: 'your_secret_key'
});

// Verify a transaction
async function verifyTransaction(transactionId) {
  try {
    const result = await payClient.verify(transactionId);
    
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

### Constructor

```typescript
new _100Pay({
  publicKey: string;
  secretKey: string;
})
```

| Parameter | Type | Description |
|-----------|------|-------------|
| publicKey | string | Your 100Pay public API key |
| secretKey | string | Your 100Pay secret API key |

### Methods

#### verify(transactionId: string): Promise<VerifyResponse>

Verifies a crypto payment transaction.

| Parameter | Type | Description |
|-----------|------|-------------|
| transactionId | string | The ID of the transaction to verify |

Returns a Promise that resolves to a `VerifyResponse` object:

```typescript
interface VerifyResponse {
  status: 'success' | 'error';
  data: TransactionData | Record<string, never>;
  message?: string;
}
```

## Development

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/shop100global/100pay.js.git
   cd 100pay.js
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

### Scripts

The following npm scripts are available:

* `npm run build` - Build the TypeScript code
* `npm run build:clean` - Clean the dist directory and build
* `npm run type-check` - Check TypeScript types without emitting files
* `npm run test` - Run tests
* `npm run test:watch` - Run tests in watch mode
* `npm run test:coverage` - Run tests with coverage report
* `npm run lint` - Lint the code
* `npm run lint:fix` - Lint and fix code
* `npm run verify` - Run linting, tests, and build

## Note on HTTP Client

This package has migrated from the deprecated `request` library to `axios` for making HTTP requests. This provides better TypeScript support and improved error handling.
