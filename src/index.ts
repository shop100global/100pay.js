// src/index.ts

import axios, { AxiosError, AxiosResponse } from "axios";
import * as crypto from "crypto";
import {
  CreateSubAccountData,
  CreateSubAccountResponse,
} from "./types/subAccount";
import { CurrencyConversionPayload, CurrencyConversionResult } from "./types";

/**
 * Configuration interface for initializing the Pay100 SDK
 * @property publicKey - API public key required for all API calls
 * @property secretKey - Secret key used for server-side authentication and request signing
 * @property baseUrl - Optional API base URL, defaults to production endpoint
 */
interface IPay100Config {
  publicKey: string;
  secretKey?: string;
  baseUrl?: string;
}

/**
 * Interface representing transaction data returned from payment verification
 * Flexible structure to accommodate various transaction types and properties
 */
interface ITransactionData {
  [key: string]: unknown;
}

/**
 * Interface for raw API responses before processing
 * Provides a flexible structure while capturing common response elements
 */
interface IRawApiResponse {
  status?: string;
  message?: string;
  data?: unknown;
  [key: string]: unknown;
}

/**
 * Standardized response interface for transaction verification
 * @property status - Result status ('success' or 'error')
 * @property data - Transaction details when successful, empty object on failure
 * @property message - Optional response message, typically present on errors
 */
interface IVerifyResponse {
  status: "success" | "error";
  data: ITransactionData | Record<string, never>;
  message?: string;
}

// Default API endpoint if not otherwise specified
const BASE_URL = process.env.BASE_URL || "https://api.100pay.co";

/**
 * Custom error class for payment verification failures
 * Provides consistent error structure for better error handling
 */
export class PaymentVerificationError extends Error {
  status: string;
  data: Record<string, never>;

  constructor(message: string) {
    super(message);
    this.name = "PaymentVerificationError";
    this.status = "error";
    this.data = {};
  }
}

/**
 * Main SDK class for interacting with the 100Pay payment platform
 * Provides methods for transaction verification, subaccount management,
 * and currency conversion
 */
export class Pay100 {
  private publicKey: string;
  private secretKey?: string;
  private baseUrl: string;

  /**
   * Initialize the Pay100 SDK
   * @param config - Configuration object containing API keys and optional base URL
   */
  constructor({ publicKey, secretKey, baseUrl = BASE_URL }: IPay100Config) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Creates a cryptographic signature for secure server-to-server communication
   *
   * @param payload - Request payload that needs to be signed
   * @returns Object containing current timestamp and HMAC SHA-256 signature
   * @throws Error if secret key is missing or invalid
   */
  private createSignature(payload: Record<string, unknown>): {
    timestamp: string;
    signature: string;
  } {
    const timestamp = Date.now().toString();

    // Extract the token part from the secret key if it's in the format
    // STATUS;TYPE;TOKEN (e.g., "LIVE;SK;eyJhbGciOiJIUzI1...")
    let signingSecret = this?.secretKey;

    if (this?.secretKey?.includes(";")) {
      const secretKeyParts = this.secretKey.split(";");
      if (secretKeyParts.length === 3) {
        // Use just the token part as the signing secret
        signingSecret = secretKeyParts[2];
      }
    }

    if (!signingSecret) {
      throw new Error("Secret key is required for signing");
    }

    // Create signature using HMAC SHA-256
    const signature = crypto
      .createHmac("sha256", signingSecret)
      .update(timestamp + JSON.stringify(payload))
      .digest("hex");

    return { timestamp, signature };
  }

  /**
   * Constructs HTTP headers for API requests with optional authentication
   *
   * @param payload - Request payload used to generate security signature
   * @returns Object containing all necessary HTTP headers
   */
  private getHeaders(
    payload: Record<string, unknown> = {}
  ): Record<string, string> {
    // Generate authentication headers if secret key is available (server-side mode)
    if (this.secretKey) {
      const { timestamp, signature } = this.createSignature(payload);
      return {
        "api-key": this.publicKey,
        "x-secret-key": this.secretKey,
        "x-timestamp": timestamp,
        "x-signature": signature,
        "Content-Type": "application/json",
      };
    }

    // Basic headers for public API usage (client-side mode)
    return {
      "api-key": this.publicKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Verifies the status and details of a payment transaction
   *
   * @param transactionId - Unique identifier of the transaction to verify
   * @returns Promise resolving to verification result with transaction data
   * @throws PaymentVerificationError on network issues or invalid responses
   */
  verify = async (transactionId: string): Promise<IVerifyResponse> => {
    try {
      const payload = { transactionId };

      const response: AxiosResponse<IRawApiResponse> = await axios({
        method: "POST",
        url: `${this.baseUrl}/api/v1/pay/crypto/payment/${transactionId}`,
        headers: this.getHeaders(payload),
        data: payload,
      });

      // Handle empty response
      if (!response.data) {
        return {
          status: "error",
          data: {},
          message:
            "Something went wrong, be sure you supplied a valid payment id.",
        };
      }

      // Handle string responses which indicate errors
      if (typeof response.data === "string") {
        if (response.data === "Access Denied, Invalid KEY supplied") {
          return {
            status: "error",
            data: {},
            message: "Access Denied, Invalid KEY supplied",
          };
        }

        if (response.data === "invalid payment id supplied") {
          return {
            status: "error",
            data: {},
          };
        }
      }

      // Validate and transform response data to ensure type safety
      const responseData = response.data;

      // Ensure the response data is an object that can be safely cast to ITransactionData
      const transactionData: ITransactionData =
        responseData && typeof responseData === "object"
          ? (responseData as ITransactionData)
          : {};

      // Return successful response with properly typed data
      return {
        status: "success",
        data: transactionData,
      };
    } catch (error) {
      // Handle Axios errors with detailed message
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new PaymentVerificationError(
          axiosError.message ||
            "Something went wrong, be sure you supplied a valid payment id."
        );
      }

      // Handle other errors with appropriate message
      throw new PaymentVerificationError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  /**
   * Namespace for subaccount management operations
   * Provides methods to create and manage subaccounts
   */
  subaccounts = {
    /**
     * Creates a new subaccount within the platform
     *
     * @param data - Subaccount configuration including owner details and supported currencies
     * @returns Promise resolving to the created subaccount details
     * @throws Error if the request fails or returns invalid data
     */
    create: async (
      data: CreateSubAccountData
    ): Promise<CreateSubAccountResponse> => {
      return this.request<CreateSubAccountResponse>(
        "POST",
        "/api/v1/assets/subaccount/create",
        data
      );
    },
  };

  /**
   * Namespace for currency conversion operations
   * Provides methods to calculate exchange rates and fees
   */
  conversion = {
    /**
     * Calculates a preview of currency conversion with rates and fees
     *
     * @param data - Conversion details including amount, source and target currencies
     * @returns Promise resolving to detailed conversion calculation
     * @throws Error if the request fails or returns invalid data
     */
    preview: async (
      data: CurrencyConversionPayload
    ): Promise<CurrencyConversionResult> => {
      return this.request<CurrencyConversionResult>(
        "POST",
        "/api/v1/user/preview-convert-asset",
        {
          amount: data.amount,
          to_symbol: data.toSymbol,
          from_symbol: data.fromSymbol,
          appId: data.appId,
        }
      );
    },
  };

  /**
   * Generic method to make authenticated API requests to any endpoint
   *
   * @param method - HTTP method to use (GET, POST, PUT, DELETE)
   * @param endpoint - API endpoint path (will be appended to base URL)
   * @param data - Request payload or query parameters
   * @returns Promise resolving to the typed API response
   * @throws Error with detailed message on request failure
   */
  async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    data: Record<string, unknown> = {}
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = this.getHeaders(data);

      const response = await axios({
        method,
        url,
        headers,
        data: method !== "GET" ? data : undefined,
        params: method === "GET" ? data : undefined,
      });

      return response.data as T;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorMessage =
          axiosError.response?.data &&
          typeof axiosError.response.data === "object" &&
          "message" in axiosError.response.data
            ? String(axiosError.response.data.message)
            : axiosError.message;

        throw new Error(`API Request Failed: ${errorMessage}`);
      }

      throw error;
    }
  }
}

export * from "./types";
