// ./src/__tests__/newFeatures.test.ts

import axios from "axios";
import { Pay100, IVerifyBankData, IBankTransferData } from "../index";
import crypto from "crypto";

jest.mock("axios");
jest.mock("crypto", () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("mocked_signature"),
  }),
}));

// Mock logger to avoid console output during tests
jest.mock("@untools/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe("Pay100 New Features", () => {
  const config = {
    publicKey: "test_public_key",
    secretKey: "test_secret_key",
  };

  let pay100: Pay100;
  let originalDateNow: () => number;

  beforeEach(() => {
    pay100 = new Pay100(config);
    jest.clearAllMocks();

    // Mock Date.now() to return a consistent timestamp for testing
    originalDateNow = Date.now;
    Date.now = jest.fn(() => 1234567890000);
  });

  afterEach(() => {
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  describe("wallet operations", () => {
    describe("getSupportedWallets", () => {
      it("should retrieve supported wallets successfully", async () => {
        const mockResponse = {
          status: "success",
          data: {
            wallets: [
              {
                id: "metamask",
                name: "MetaMask",
                type: "browser_extension",
                networks: ["ethereum", "bsc", "polygon"],
                icon: "https://cdn.100pay.co/icons/metamask.svg",
                isActive: true,
                features: ["send", "receive", "swap"],
              },
              {
                id: "trust_wallet",
                name: "Trust Wallet",
                type: "mobile_app",
                networks: ["ethereum", "bsc", "polygon", "bitcoin"],
                icon: "https://cdn.100pay.co/icons/trust.svg",
                isActive: true,
                features: ["send", "receive", "swap", "staking"],
              },
              {
                id: "phantom",
                name: "Phantom",
                type: "browser_extension",
                networks: ["solana"],
                icon: "https://cdn.100pay.co/icons/phantom.svg",
                isActive: true,
                features: ["send", "receive", "swap", "nft"],
              },
            ],
            totalCount: 3,
          },
        };

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await pay100.wallet.getSupportedWallets();

        expect(result).toEqual(mockResponse);
        expect(axios).toHaveBeenCalledWith({
          method: "GET",
          url: "https://api.100pay.co/api/v1/wallet/supported",
          headers: {
            "api-key": config.publicKey,
            "x-secret-key": config.secretKey,
            "x-timestamp": "1234567890000",
            "x-signature": "mocked_signature",
            "Content-Type": "application/json",
          },
          data: undefined,
          params: {},
        });
      });

      it("should handle empty wallet list", async () => {
        const mockResponse = {
          status: "success",
          data: [],
        };

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await pay100.wallet.getSupportedWallets();

        expect(result).toEqual(mockResponse);
        expect(result.data).toHaveLength(0);
      });

      it("should handle authentication error when retrieving wallets", async () => {
        const errorResponse = new Error(
          "API Request Failed: Invalid authentication"
        ) as Error & {
          response: {
            data: {
              message: string;
            };
            status: number;
          };
          isAxiosError: boolean;
        };

        errorResponse.response = {
          data: {
            message: "Invalid authentication",
          },
          status: 401,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        await expect(pay100.wallet.getSupportedWallets()).rejects.toThrow(
          "API Request Failed: Invalid authentication"
        );
      });

      it("should handle network error when retrieving wallets", async () => {
        const errorResponse = new Error(
          "API Request Failed: Network Error"
        ) as Error & {
          isAxiosError: boolean;
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        await expect(pay100.wallet.getSupportedWallets()).rejects.toThrow(
          "API Request Failed: Network Error"
        );
      });
    });
  });

  describe("bank transfer operations", () => {
    describe("getBankList", () => {
      it("should retrieve bank list successfully", async () => {
        const mockResponse = {
          status: "success",
          data: {
            banks: [
              {
                id: "044",
                name: "Access Bank",
                code: "044",
                country: "NG",
                currency: "NGN",
                isActive: true,
                logo: "https://cdn.100pay.co/banks/access.png",
              },
              {
                id: "011",
                name: "First Bank of Nigeria",
                code: "011",
                country: "NG",
                currency: "NGN",
                isActive: true,
                logo: "https://cdn.100pay.co/banks/firstbank.png",
              },
              {
                id: "058",
                name: "Guaranty Trust Bank",
                code: "058",
                country: "NG",
                currency: "NGN",
                isActive: true,
                logo: "https://cdn.100pay.co/banks/gtb.png",
              },
            ],
            totalCount: 3,
          },
        };

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await pay100.bankTransfer.getBankList();

        expect(result).toEqual(mockResponse);
        expect(axios).toHaveBeenCalledWith({
          method: "GET",
          url: "https://api.100pay.co/api/v1/bank-transfers/banks",
          headers: {
            "api-key": config.publicKey,
            "x-secret-key": config.secretKey,
            "x-timestamp": "1234567890000",
            "x-signature": "mocked_signature",
            "Content-Type": "application/json",
          },
          data: undefined,
          params: {},
        });
      });

      it("should handle error when retrieving bank list", async () => {
        const errorResponse = new Error(
          "API Request Failed: Service temporarily unavailable"
        ) as Error & {
          response: {
            data: {
              message: string;
            };
            status: number;
          };
          isAxiosError: boolean;
        };

        errorResponse.response = {
          data: {
            message: "Service temporarily unavailable",
          },
          status: 503,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        await expect(pay100.bankTransfer.getBankList()).rejects.toThrow(
          "API Request Failed: Service temporarily unavailable"
        );
      });
    });

    describe("verifyBank", () => {
      it("should verify bank account successfully", async () => {
        const mockResponse = {
          status: "success",
          data: {
            accountNumber: "0123456789",
            accountName: "JOHN DOE SMITH",
            bankCode: "044",
            bankName: "Access Bank",
            isValid: true,
            verificationId: "ver_12345",
            verifiedAt: "2025-06-29T10:30:00Z",
          },
        };

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockResolvedValueOnce({
          data: mockResponse,
        });

        const verifyData: IVerifyBankData = {
          accountNumber: "0123456789",
          bankCode: "044",
        };

        const result = await pay100.bankTransfer.verifyBank(verifyData);

        expect(result).toEqual(mockResponse);
        expect(axios).toHaveBeenCalledWith({
          method: "POST",
          url: "https://api.100pay.co/api/v1/bank-transfers/verify-account",
          headers: {
            "api-key": config.publicKey,
            "x-secret-key": config.secretKey,
            "x-timestamp": "1234567890000",
            "x-signature": "mocked_signature",
            "Content-Type": "application/json",
          },
          data: verifyData,
          params: undefined,
        });
      });

      it("should handle invalid bank code during verification", async () => {
        const errorResponse = new Error(
          "API Request Failed: Invalid bank code"
        ) as Error & {
          response: {
            data: {
              message: string;
            };
            status: number;
          };
          isAxiosError: boolean;
        };

        errorResponse.response = {
          data: {
            message: "Invalid bank code",
          },
          status: 400,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const verifyData: IVerifyBankData = {
          accountNumber: "0123456789",
          bankCode: "999",
        };

        await expect(
          pay100.bankTransfer.verifyBank(verifyData)
        ).rejects.toThrow("API Request Failed: Invalid bank code");
      });

      it("should handle malformed account number during verification", async () => {
        const errorResponse = new Error(
          "API Request Failed: Account number must be 10 digits"
        ) as Error & {
          response: {
            data: {
              message: string;
            };
            status: number;
          };
          isAxiosError: boolean;
        };

        errorResponse.response = {
          data: {
            message: "Account number must be 10 digits",
          },
          status: 400,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const verifyData: IVerifyBankData = {
          accountNumber: "123", // Too short
          bankCode: "044",
        };

        await expect(
          pay100.bankTransfer.verifyBank(verifyData)
        ).rejects.toThrow(
          "API Request Failed: Account number must be 10 digits"
        );
      });
    });

    describe("transfer", () => {
      it("should execute bank transfer successfully", async () => {
        const mockResponse = {
          status: "success",
          data: {
            transferId: "bt_12345",
            reference: "ref_bank_12345",
            amount: "50000.00",
            currency: "NGN",
            fee: "100.00",
            totalAmount: "50100.00",
            recipientName: "JOHN DOE SMITH",
            recipientAccount: "0123456789",
            bankName: "Access Bank",
            bankCode: "044",
            status: "processing",
            createdAt: "2025-06-29T10:40:00Z",
            estimatedCompletionTime: "2025-06-29T10:45:00Z",
            transactionPin: "123456",
          },
        };

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockResolvedValueOnce({
          data: mockResponse,
        });

        const transferData: IBankTransferData = {
          amount: 50000,
          beneficiaryAccountNumber: "0123456789",
          beneficiaryBankCode: "044",
          beneficiaryAccountName: "JOHN DOE SMITH",
          reference: "ref_bank_12345",
          narration: "Payment for services",
          transactionPin: "123456",
          appId: "app123",
          saveBeneficiary: true,
          paymentReference: "ref_bank_12345",
        };

        const result = await pay100.bankTransfer.transfer(transferData);

        expect(result).toEqual(mockResponse);
        expect(axios).toHaveBeenCalledWith({
          method: "POST",
          url: "https://api.100pay.co/api/v1/bank-transfers",
          headers: {
            "api-key": config.publicKey,
            "x-secret-key": config.secretKey,
            "x-timestamp": "1234567890000",
            "x-signature": "mocked_signature",
            "Content-Type": "application/json",
          },
          data: transferData,
          params: undefined,
        });
      });

      it("should handle insufficient balance during bank transfer", async () => {
        const errorResponse = new Error(
          "API Request Failed: Insufficient balance"
        ) as Error & {
          response: {
            data: {
              message: string;
              error: {
                code: string;
                details: string;
              };
            };
            status: number;
          };
          isAxiosError: boolean;
        };

        errorResponse.response = {
          data: {
            message: "Insufficient balance",
            error: {
              code: "INSUFFICIENT_BALANCE",
              details:
                "Your account balance is insufficient for this transaction",
            },
          },
          status: 400,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const transferData: IBankTransferData = {
          amount: 5000000,
          beneficiaryAccountNumber: "0123456789",
          beneficiaryBankCode: "044",
          beneficiaryAccountName: "JOHN DOE SMITH",
          reference: "ref_bank_12345",
          narration: "Payment for services",
          transactionPin: "123456",
          appId: "app123",
          saveBeneficiary: true,
          paymentReference: "ref_bank_12345",
        };

        await expect(
          pay100.bankTransfer.transfer(transferData)
        ).rejects.toThrow("API Request Failed: Insufficient balance");
      });

      it("should handle invalid transaction PIN during bank transfer", async () => {
        const errorResponse = new Error(
          "API Request Failed: Invalid transaction PIN"
        ) as Error & {
          response: {
            data: {
              message: string;
            };
            status: number;
          };
          isAxiosError: boolean;
        };

        errorResponse.response = {
          data: {
            message: "Invalid transaction PIN",
          },
          status: 401,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const transferData: IBankTransferData = {
          amount: 50000,
          beneficiaryAccountNumber: "0123456789",
          beneficiaryBankCode: "044",
          beneficiaryAccountName: "JOHN DOE SMITH",
          reference: "ref_bank_12345",
          narration: "Payment for services",
          transactionPin: "wrong_pin",
          appId: "app123",
          saveBeneficiary: true,
          paymentReference: "ref_bank_12345",
        };

        await expect(
          pay100.bankTransfer.transfer(transferData)
        ).rejects.toThrow("API Request Failed: Invalid transaction PIN");
      });

      it("should handle bank service unavailable during transfer", async () => {
        const errorResponse = new Error(
          "API Request Failed: Bank service temporarily unavailable"
        ) as Error & {
          response: {
            data: {
              message: string;
              error: {
                code: string;
                retryAfter: number;
              };
            };
            status: number;
          };
          isAxiosError: boolean;
        };

        errorResponse.response = {
          data: {
            message: "Bank service temporarily unavailable",
            error: {
              code: "BANK_SERVICE_UNAVAILABLE",
              retryAfter: 300, // 5 minutes
            },
          },
          status: 503,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const transferData: IBankTransferData = {
          amount: 50000,
          beneficiaryAccountNumber: "0123456789",
          beneficiaryBankCode: "044",
          beneficiaryAccountName: "JOHN DOE SMITH",
          reference: "ref_bank_12345",
          narration: "Payment for services",
          transactionPin: "123456",
          appId: "app123",
          saveBeneficiary: true,
          paymentReference: "ref_bank_12345",
        };

        await expect(
          pay100.bankTransfer.transfer(transferData)
        ).rejects.toThrow(
          "API Request Failed: Bank service temporarily unavailable"
        );
      });

      it("should handle duplicate reference during bank transfer", async () => {
        const errorResponse = new Error(
          "API Request Failed: Duplicate transaction reference"
        ) as Error & {
          response: {
            data: {
              message: string;
              error: {
                code: string;
                existingTransactionId: string;
              };
            };
            status: number;
          };
          isAxiosError: boolean;
        };

        errorResponse.response = {
          data: {
            message: "Duplicate transaction reference",
            error: {
              code: "DUPLICATE_REFERENCE",
              existingTransactionId: "bt_11111",
            },
          },
          status: 409,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const transferData: IBankTransferData = {
          amount: 50000,
          beneficiaryAccountNumber: "0123456789",
          beneficiaryBankCode: "044",
          beneficiaryAccountName: "JOHN DOE SMITH",
          reference: "ref_bank_12345",
          narration: "Payment for services",
          transactionPin: "123456",
          appId: "app123",
          saveBeneficiary: true,
          paymentReference: "ref_bank_12345",
        };

        await expect(
          pay100.bankTransfer.transfer(transferData)
        ).rejects.toThrow(
          "API Request Failed: Duplicate transaction reference"
        );
      });

      it("should handle invalid recipient account during bank transfer", async () => {
        const errorResponse = new Error(
          "API Request Failed: Invalid recipient account"
        ) as Error & {
          response: {
            data: {
              message: string;
            };
            status: number;
          };
          isAxiosError: boolean;
        };

        errorResponse.response = {
          data: {
            message: "Invalid recipient account",
          },
          status: 400,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const transferData: IBankTransferData = {
          amount: 50000,
          beneficiaryAccountNumber: "0123456789",
          beneficiaryBankCode: "044",
          beneficiaryAccountName: "JOHN DOE SMITH",
          reference: "ref_bank_12345",
          narration: "Payment for services",
          transactionPin: "123456",
          appId: "app123",
          saveBeneficiary: true,
          paymentReference: "ref_bank_12345",
        };

        await expect(
          pay100.bankTransfer.transfer(transferData)
        ).rejects.toThrow("API Request Failed: Invalid recipient account");
      });
    });
  });

  describe("signature creation with formatted secret key", () => {
    it("should handle secret key in STATUS;TYPE;TOKEN format", () => {
      const formattedSecretKey = "LIVE;SK;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const pay100WithFormattedKey = new Pay100({
        publicKey: "test_public_key",
        secretKey: formattedSecretKey,
      });

      const mockResponse = {
        status: "success",
        data: { result: "test" },
      };

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: mockResponse,
      });

      // This should not throw an error when creating signature
      expect(async () => {
        await pay100WithFormattedKey.request("GET", "/api/test");
      }).not.toThrow();

      // Verify that the token part is used for signature generation
      expect(crypto.createHmac).toHaveBeenCalledWith(
        "sha256",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" // Only the token part
      );
    });

    it("should use full secret key if not in formatted format", () => {
      const regularSecretKey = "simple_secret_key";
      const pay100WithRegularKey = new Pay100({
        publicKey: "test_public_key",
        secretKey: regularSecretKey,
      });

      const mockResponse = {
        status: "success",
        data: { result: "test" },
      };

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: mockResponse,
      });

      // This should not throw an error
      expect(async () => {
        await pay100WithRegularKey.request("GET", "/api/test");
      }).not.toThrow();

      // Verify that the full secret key is used
      expect(crypto.createHmac).toHaveBeenCalledWith(
        "sha256",
        regularSecretKey
      );
    });
  });
});
