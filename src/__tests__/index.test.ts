// ./src/__tests__/index.test.ts

import axios from "axios";
import crypto from "crypto";
import {
  CreateSubAccountData,
  CurrencyConversionPayload,
  Pay100,
  PaymentVerificationError,
  ITransferAssetData,
  ITransferHistoryParams,
  ITransferFeeParams,
} from "../index";

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

describe("Pay100", () => {
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

  describe("verify", () => {
    it("should successfully verify a transaction", async () => {
      const mockResponse = {
        status: "completed",
        amount: "100",
        currency: "USDT",
      };

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await pay100.verify("valid_transaction_id");

      expect(result).toEqual({
        status: "success",
        data: mockResponse,
      });

      // Verify that axios was called with the correct parameters including new headers
      expect(axios).toHaveBeenCalledWith({
        method: "POST",
        url: "https://api.100pay.co/api/v1/pay/crypto/payment/valid_transaction_id",
        headers: {
          "api-key": config.publicKey,
          "x-secret-key": config.secretKey,
          "x-timestamp": "1234567890000",
          "x-signature": "mocked_signature",
          "Content-Type": "application/json",
        },
        data: { transactionId: "valid_transaction_id" },
      });

      // Verify crypto was called correctly for signature generation
      expect(crypto.createHmac).toHaveBeenCalledWith(
        "sha256",
        config.secretKey
      );

      // Fix unbound method error by using an arrow function
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const updateMethod = crypto.createHmac("sha256", "").update;
      expect(updateMethod).toHaveBeenCalledWith(
        `1234567890000${JSON.stringify({
          transactionId: "valid_transaction_id",
        })}`
      );
    });

    it("should handle empty response data", async () => {
      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: null,
      });

      const result = await pay100.verify("transaction_id");

      expect(result).toEqual({
        status: "error",
        data: null,
        message:
          "Something went wrong, be sure you supplied a valid payment id.",
      });
    });

    it("should handle invalid API key error", async () => {
      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: "Access Denied, Invalid KEY supplied",
      });

      const result = await pay100.verify("transaction_id");

      expect(result).toEqual({
        status: "error",
        data: null,
        message: "Access Denied, Invalid KEY supplied",
      });
    });

    it("should handle invalid payment ID error", async () => {
      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: "invalid payment id supplied",
      });

      const result = await pay100.verify("invalid_id");

      expect(result).toEqual({
        status: "error",
        data: null,
      });
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network Error");
      Object.defineProperty(networkError, "isAxiosError", { value: true });
      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(networkError);

      await expect(pay100.verify("transaction_id")).rejects.toThrow(
        new PaymentVerificationError("Network Error")
      );
    });
  });

  describe("request", () => {
    it("should make a POST request with correct headers and payload", async () => {
      const mockResponse = {
        status: "success",
        data: { result: "test" },
      };

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: mockResponse,
      });

      const payload = { param1: "value1", param2: "value2" };
      const result = await pay100.request("POST", "/api/test", payload);

      expect(result).toEqual(mockResponse);
      expect(axios).toHaveBeenCalledWith({
        method: "POST",
        url: "https://api.100pay.co/api/test",
        headers: {
          "api-key": config.publicKey,
          "x-secret-key": config.secretKey,
          "x-timestamp": "1234567890000",
          "x-signature": "mocked_signature",
          "Content-Type": "application/json",
        },
        data: payload,
        params: undefined,
      });
    });

    it("should make a GET request with params instead of data", async () => {
      const mockResponse = {
        status: "success",
        data: { result: "test" },
      };

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: mockResponse,
      });

      const params = { filter: "active" };
      const result = await pay100.request("GET", "/api/items", params);

      expect(result).toEqual(mockResponse);
      expect(axios).toHaveBeenCalledWith({
        method: "GET",
        url: "https://api.100pay.co/api/items",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        headers: expect.any(Object),
        data: undefined,
        params,
      });
    });

    it("should handle error responses with structured error messages", async () => {
      const errorResponse = new Error(
        "Request failed with status code 404"
      ) as Error & {
        response: {
          data: {
            message: string;
            error?: string;
          };
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        data: {
          message: "Resource not found",
          error: "Resource not found",
        },
        status: 404,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      await expect(pay100.request("GET", "/api/nonexistent")).rejects.toThrow(
        "Request failed with status code 404"
      );
    });

    it("should handle error responses with message property", async () => {
      const errorResponse = new Error("Request failed") as Error & {
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
          message: "Error from message property",
        },
        status: 400,
      };
      errorResponse.isAxiosError = true;
      errorResponse.message = "Request failed with status code 400"; // Add this line

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      await expect(pay100.request("GET", "/api/test")).rejects.toThrow(
        "Request failed with status code 400" // Update expected error message
      );
    });

    it("should handle error responses with response but no data", async () => {
      const errorResponse = new Error("Request failed") as Error & {
        response: {
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        status: 500,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      await expect(pay100.request("GET", "/api/test")).rejects.toThrow(
        "Request failed"
      );
    });
  });

  describe("constructor", () => {
    it("should use default baseUrl if not provided", () => {
      const instance = new Pay100(config);
      // Fix accessing any type with proper type casting
      expect((instance as unknown as { baseUrl: string }).baseUrl).toBe(
        "https://api.100pay.co"
      );
    });

    it("should use custom baseUrl if provided", () => {
      const customConfig = {
        ...config,
        baseUrl: "https://test-api.example.com",
      };

      const instance = new Pay100(customConfig);
      // Fix accessing any type with proper type casting
      expect((instance as unknown as { baseUrl: string }).baseUrl).toBe(
        "https://test-api.example.com"
      );
    });
  });

  describe("subaccounts", () => {
    let pay100: Pay100;

    beforeEach(() => {
      pay100 = new Pay100({
        publicKey: "test_public_key",
        secretKey: "test_secret_key",
      });
      jest.clearAllMocks();

      // Mock Date.now() to return a consistent timestamp for testing
      jest.spyOn(Date, "now").mockReturnValue(1234567890000);
    });

    it("should create a sub account successfully", async () => {
      const mockResponse = {
        status: "success",
        data: {
          id: "1",
          name: "Test Account",
          email: "test@example.com",
          status: "active",
        },
      };

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: mockResponse,
      });

      const subaccountData: CreateSubAccountData = {
        symbols: ["USDT"],
        networks: ["bsc"],
        owner: {
          name: "originalmiracleio2",
          email: "miracleficient@gmail.com",
          phone: "+234813 515 5549",
        },
        metadata: {},
      };

      const result = await pay100.subaccounts.create(subaccountData);
      expect(result).toEqual(mockResponse);
      expect(axios).toHaveBeenCalledWith({
        method: "POST",
        url: "https://api.100pay.co/api/v1/assets/subaccount/create",
        headers: {
          "api-key": config.publicKey,
          "x-secret-key": config.secretKey,
          "x-timestamp": "1234567890000",
          "x-signature": "mocked_signature",
          "Content-Type": "application/json",
        },
        data: subaccountData,
        params: undefined,
      });
    });

    it("should handle error when creating sub account", async () => {
      const errorResponse = new Error(
        "API Request Failed: Email already exists"
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
          message: "Email already exists",
        },
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      const subaccountData = {
        symbols: ["USDT"],
        networks: ["bsc"],
        owner: {
          name: "originalmiracleio2",
          email: "miracleficient@gmail.com",
          phone: "+234813 515 5549",
        },
        metadata: {},
      };

      await expect(pay100.subaccounts.create(subaccountData)).rejects.toThrow(
        "API Request Failed: Email already exists"
      );
    });
  });

  describe("conversion", () => {
    let pay100: Pay100;

    beforeEach(() => {
      pay100 = new Pay100({
        publicKey: "test_public_key",
        secretKey: "test_secret_key",
      });
      jest.clearAllMocks();

      // Mock Date.now() to return a consistent timestamp for testing
      jest.spyOn(Date, "now").mockReturnValue(1234567890000);
    });

    it("should get currency conversion preview", async () => {
      const mockResponse = {
        status: "success",
        data: {
          fromAmount: "100",
          toAmount: "85",
          fromCurrency: "USDT",
          toCurrency: "USD",
          rate: "0.85",
        },
      };

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: mockResponse,
      });

      const conversionData: CurrencyConversionPayload = {
        amount: 100,
        fromSymbol: "USDT",
        toSymbol: "USD",
        appId: "app123",
      };

      const result = await pay100.conversion.preview(conversionData);
      expect(result).toEqual(mockResponse);
      expect(axios).toHaveBeenCalledWith({
        method: "POST",
        url: "https://api.100pay.co/api/v1/user/preview-convert-asset",
        headers: {
          "api-key": config.publicKey,
          "x-secret-key": config.secretKey,
          "x-timestamp": "1234567890000",
          "x-signature": "mocked_signature",
          "Content-Type": "application/json",
        },
        data: {
          amount: 100,
          from_symbol: "USDT",
          to_symbol: "USD",
          appId: "app123",
        },
        params: undefined,
      });
    });

    it("should handle invalid currency error during conversion preview", async () => {
      const errorResponse = new Error(
        "API Request Failed: Invalid currency pair"
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
          message: "Invalid currency pair",
        },
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      const conversionData: CurrencyConversionPayload = {
        amount: 100,
        fromSymbol: "INVALID",
        toSymbol: "USD",
        appId: "app123",
      };

      await expect(pay100.conversion.preview(conversionData)).rejects.toThrow(
        "API Request Failed: Invalid currency pair"
      );
    });
  });

  describe("transfer", () => {
    let pay100: Pay100;

    beforeEach(() => {
      pay100 = new Pay100({
        publicKey: "test_public_key",
        secretKey: "test_secret_key",
      });
      jest.clearAllMocks();

      // Mock Date.now() to return a consistent timestamp for testing
      jest.spyOn(Date, "now").mockReturnValue(1234567890000);
    });

    describe("executeTransfer", () => {
      it("should execute a transfer successfully", async () => {
        const mockResponse = {
          status: "success",
          data: {
            id: "tr_12345",
            amount: "100.00",
            fee: "2.50",
            symbol: "USDT",
            network: "bsc",
            reference: "ref_12345",
            createdAt: "2025-04-29T12:00:00Z",
            status: "completed",
            senderAccount: "wallet_sender_123",
            receiverAccount: "wallet_receiver_456",
          },
        };

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockResolvedValueOnce({
          data: mockResponse,
        });

        const transferData: ITransferAssetData = {
          amount: 100,
          symbol: "USDT",
          network: "bsc",
          to: "wallet_sender_123",
          receiverAccount: "wallet_receiver_456",
          reference: "ref_12345",
          transactionPin: "123456",
          appId: "app123",
        };

        const result = await pay100.transfer.executeTransfer(transferData);
        expect(result).toEqual(mockResponse);
        expect(axios).toHaveBeenCalledWith({
          method: "POST",
          url: "https://api.100pay.co/api/v1/transfer/asset",
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

      it("should handle insufficient funds error during transfer", async () => {
        const errorResponse = new Error(
          "API Request Failed: Insufficient funds"
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
            message: "Insufficient funds",
          },
          status: 400,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const transferData: ITransferAssetData = {
          amount: 10000,
          symbol: "USDT",
          network: "bsc",
          to: "wallet_receiver_456",
          reference: "ref_12345",
          transactionPin: "123456",
          appId: "app123",
        };

        await expect(
          pay100.transfer.executeTransfer(transferData)
        ).rejects.toThrow("API Request Failed: Insufficient funds");
      });

      it("should handle invalid account error during transfer", async () => {
        const errorResponse = new Error(
          "API Request Failed: Invalid receiver account"
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
            message: "Invalid receiver account",
          },
          status: 400,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const transferData: ITransferAssetData = {
          amount: 100,
          symbol: "USDT",
          network: "bsc",
          to: "invalid_account",
          reference: "ref_12345",
          transactionPin: "123456",
          appId: "app123",
        };

        await expect(
          pay100.transfer.executeTransfer(transferData)
        ).rejects.toThrow("API Request Failed: Invalid receiver account");
      });
    });

    describe("getHistory", () => {
      it("should retrieve transfer history successfully", async () => {
        const mockResponse = {
          status: "success",
          data: {
            transfers: [
              {
                id: "tr_12345",
                amount: "100.00",
                fee: "2.50",
                symbol: "USDT",
                network: "bsc",
                reference: "ref_12345",
                createdAt: "2025-04-29T12:00:00Z",
                status: "completed",
                senderAccount: "wallet_sender_123",
                receiverAccount: "wallet_receiver_456",
              },
              {
                id: "tr_12346",
                amount: "50.00",
                fee: "1.25",
                symbol: "BTC",
                network: "btc",
                reference: "ref_12346",
                createdAt: "2025-04-28T10:00:00Z",
                status: "completed",
                senderAccount: "wallet_sender_123",
                receiverAccount: "wallet_receiver_789",
              },
            ],
            pagination: {
              currentPage: 1,
              totalPages: 5,
              totalRecords: 100,
              limit: 20,
            },
          },
        };

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockResolvedValueOnce({
          data: mockResponse,
        });

        const historyParams: ITransferHistoryParams = {
          appId: "app123",
          page: 1,
          limit: 20,
          startDate: "2025-01-01",
          endDate: "2025-04-29",
          status: "completed",
          symbol: "USDT",
        };

        const result = await pay100.transfer.getHistory(historyParams);
        expect(result).toEqual(mockResponse);
        expect(axios).toHaveBeenCalledWith({
          method: "GET",
          url: "https://api.100pay.co/api/v1/transfer/history",
          headers: {
            "api-key": config.publicKey,
            "x-secret-key": config.secretKey,
            "x-timestamp": "1234567890000",
            "x-signature": "mocked_signature",
            "Content-Type": "application/json",
          },
          data: undefined,
          params: historyParams,
        });
      });

      it("should handle validation error when retrieving transfer history", async () => {
        const errorResponse = new Error(
          "API Request Failed: Invalid date range"
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
            message: "Invalid date range",
          },
          status: 400,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const historyParams: ITransferHistoryParams = {
          appId: "app123",
          page: 1,
          limit: 20,
          startDate: "2025-05-01", // Future date
          endDate: "2025-04-29", // Past date (invalid range)
        };

        await expect(pay100.transfer.getHistory(historyParams)).rejects.toThrow(
          "API Request Failed: Invalid date range"
        );
      });
    });

    describe("calculateFee", () => {
      it("should calculate transfer fee successfully", async () => {
        const mockResponse = {
          status: "success",
          data: {
            symbol: "USDT",
            network: "bsc",
            feeAmount: "2.50",
            feePercentage: "2.5%",
            minFee: "1.00",
            maxFee: "100.00",
          },
        };

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockResolvedValueOnce({
          data: mockResponse,
        });

        const feeParams: ITransferFeeParams = {
          symbol: "USDT",
          network: "bsc",
          type: "internal",
        };

        const result = await pay100.transfer.calculateFee(feeParams);
        expect(result).toEqual(mockResponse);
        expect(axios).toHaveBeenCalledWith({
          method: "GET",
          url: "https://api.100pay.co/api/v1/transfer/fee",
          headers: {
            "api-key": config.publicKey,
            "x-secret-key": config.secretKey,
            "x-timestamp": "1234567890000",
            "x-signature": "mocked_signature",
            "Content-Type": "application/json",
          },
          data: undefined,
          params: feeParams,
        });
      });

      it("should handle unsupported currency error when calculating fee", async () => {
        const errorResponse = new Error(
          "API Request Failed: Unsupported currency"
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
            message: "Unsupported currency",
          },
          status: 400,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const feeParams: ITransferFeeParams = {
          symbol: "UNKNOWN",
          network: "bsc",
          type: "internal",
        };

        await expect(pay100.transfer.calculateFee(feeParams)).rejects.toThrow(
          "API Request Failed: Unsupported currency"
        );
      });

      it("should handle unsupported transfer type when calculating fee", async () => {
        const errorResponse = new Error(
          "API Request Failed: Invalid transfer type"
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
            message: "Invalid transfer type",
          },
          status: 400,
        };
        errorResponse.isAxiosError = true;

        (
          axios as unknown as jest.MockedFunction<typeof axios>
        ).mockRejectedValueOnce(errorResponse);

        const feeParams: ITransferFeeParams = {
          symbol: "USDT",
          network: "bsc",
          type: "invalid",
        };

        await expect(pay100.transfer.calculateFee(feeParams)).rejects.toThrow(
          "API Request Failed: Invalid transfer type"
        );
      });
    });
  });
});
