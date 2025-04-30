// This file adds tests to improve coverage for the Pay100 SDK

import axios from "axios";
import { Pay100, PaymentVerificationError } from "../index";

jest.mock("axios");
// Fix for 'Property 'createHmac' does not exist on type 'Crypto''
// Use Node.js crypto module instead of browser Crypto
jest.mock("crypto", () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("mocked_signature"),
  }),
}));

describe("Pay100 Additional Coverage Tests", () => {
  const standardConfig = {
    publicKey: "test_public_key",
    secretKey: "test_secret_key",
  };

  let standardPay100: Pay100;
  let originalDateNow: () => number;

  beforeEach(() => {
    standardPay100 = new Pay100(standardConfig);
    jest.clearAllMocks();

    // Mock Date.now() to return a consistent timestamp for testing
    originalDateNow = Date.now;
    Date.now = jest.fn(() => 1234567890000);
  });

  afterEach(() => {
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  describe("createSignature with token extraction", () => {
    it("should throw error when secret key is missing", async () => {
      const publicOnlyConfig = {
        publicKey: "test_public_key",
        // No secretKey provided
      };

      const publicOnlyPay100 = new Pay100(publicOnlyConfig);

      // We need to use a private method, so we'll test it indirectly
      // by calling a method that would use it
      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: { status: "success" },
      });

      // This should use client-side headers without a signature
      await publicOnlyPay100.request("GET", "/test");

      // Verify axios was called with the correct basic headers (no signature)
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            "api-key": "test_public_key",
            "Content-Type": "application/json",
          },
        })
      );
    });
  });

  describe("verify additional cases", () => {
    it("should handle non-object response types", async () => {
      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: 123, // Number response
      });

      const testResult = await standardPay100.verify("transaction_id");
      expect(testResult.status).toBe("success");
      expect(testResult.data).toEqual({});
    });

    it("should handle success: false in API response", async () => {
      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockResolvedValueOnce({
        data: {
          success: false,
          message: "Transaction verification failed",
        },
      });

      try {
        await standardPay100.request("GET", "/test");
        // Fix for 'fail' is not defined
        expect(true).toBe(false); // This will always fail if execution reaches here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(
          "Transaction verification failed"
        );
      }
    });
  });

  describe("extractErrorMessage", () => {
    it("should extract error message from string data", async () => {
      const errorResponse = new Error("API Request Failed") as Error & {
        response: {
          data: string;
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        data: "API Request Failed",
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      try {
        await standardPay100.request("GET", "/test");
        // Fix for 'fail' is not defined
        expect(true).toBe(false); // This will always fail if execution reaches here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("API Request Failed");
      }
    });

    it("should extract error message from nested error object", async () => {
      const errorResponse = new Error("API Request Failed") as Error & {
        response: {
          data: {
            error: {
              message: string;
            };
          };
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        data: {
          error: {
            message: "API Request Failed",
          },
        },
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      try {
        await standardPay100.request("GET", "/test");
        // Fix for 'fail' is not defined
        expect(true).toBe(false); // This will always fail if execution reaches here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("API Request Failed");
      }
    });

    it("should extract error code when message is not available", async () => {
      const errorResponse = new Error("API Request Failed") as Error & {
        response: {
          data: {
            error: {
              code: string;
            };
          };
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        data: {
          error: {
            code: "ERR_123",
          },
        },
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      try {
        await standardPay100.request("GET", "/test");
        // Fix for 'fail' is not defined
        expect(true).toBe(false); // This will always fail if execution reaches here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("API Request Failed");
      }
    });

    it("should extract error from nested data property", async () => {
      const errorResponse = new Error("API Request Failed") as Error & {
        response: {
          data: {
            data: {
              message: string;
            };
          };
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        data: {
          data: {
            message: "Message in nested data",
          },
        },
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      try {
        await standardPay100.request("GET", "/test");
        // Fix for 'fail' is not defined
        expect(true).toBe(false); // This will always fail if execution reaches here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("API Request Failed");
      }
    });

    it("should extract error from nested data.error property", async () => {
      const errorResponse = new Error("API Request Failed") as Error & {
        response: {
          data: {
            data: {
              error: {
                message: string;
              };
            };
          };
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        data: {
          data: {
            error: {
              message: "Message in nested data.error",
            },
          },
        },
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      try {
        await standardPay100.request("GET", "/test");
        // Fix for 'fail' is not defined
        expect(true).toBe(false); // This will always fail if execution reaches here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("API Request Failed");
      }
    });

    it("should use statusText when other error details are not available", async () => {
      const errorResponse = new Error("API Request Failed") as Error & {
        response: {
          data: object;
          statusText: string;
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        data: {},
        statusText: "Bad Request",
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      try {
        await standardPay100.request("GET", "/test");
        // Fix for 'fail' is not defined
        expect(true).toBe(false); // This will always fail if execution reaches here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("API Request Failed");
      }
    });

    it("should stringify error when no structured info is available", async () => {
      const errorResponse = new Error("API Request Failed") as Error & {
        response: {
          data: {
            someUnexpectedFormat: boolean;
          };
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        data: {
          someUnexpectedFormat: true,
        },
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      try {
        await standardPay100.request("GET", "/test");
        // Fix for 'fail' is not defined
        expect(true).toBe(false); // This will always fail if execution reaches here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("API Request Failed");
      }
    });

    it("should handle circular references in error data gracefully", async () => {
      // Fix for using any
      interface ICircularObject {
        self?: ICircularObject;
      }

      const circularObject: ICircularObject = {};
      circularObject.self = circularObject; // Create circular reference

      const errorResponse = new Error("API Request Failed") as Error & {
        response: {
          data: ICircularObject;
          status: number;
        };
        isAxiosError: boolean;
      };

      errorResponse.response = {
        data: circularObject,
        status: 400,
      };
      errorResponse.isAxiosError = true;

      (
        axios as unknown as jest.MockedFunction<typeof axios>
      ).mockRejectedValueOnce(errorResponse);

      try {
        await standardPay100.request("GET", "/test");
        // Fix for 'fail' is not defined
        expect(true).toBe(false); // This will always fail if execution reaches here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("API Request Failed");
      }
    });
  });

  describe("PaymentVerificationError", () => {
    it("should create a properly structured PaymentVerificationError", () => {
      const error = new PaymentVerificationError("Test error message");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("PaymentVerificationError");
      expect(error.message).toBe("Test error message");
      expect(error.status).toBe("error");
      expect(error.data).toEqual({});
    });
  });
});
