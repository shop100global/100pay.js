import axios from "axios";
import { Pay100, PaymentVerificationError } from "../index";

jest.mock("axios");

describe("Pay100", () => {
  const config = {
    publicKey: "test_public_key",
    secretKey: "test_secret_key",
  };

  let pay100: Pay100;

  beforeEach(() => {
    pay100 = new Pay100(config);
    jest.clearAllMocks();
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

      expect(axios).toHaveBeenCalledWith({
        method: "POST",
        url: "https://api.100pay.co/api/v1/pay/crypto/payment/valid_transaction_id",
        headers: {
          "api-key": config.publicKey,
        },
      });
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
        data: {},
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
        data: {},
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
        data: {},
      });
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network Error");
      Object.defineProperty(networkError, "isAxiosError", { value: true });
      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(networkError);

      await expect(pay100.verify("transaction_id")).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new PaymentVerificationError("Network Error")
      );
    });
  });
});
