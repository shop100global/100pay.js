import axios, { AxiosError, AxiosResponse } from "axios";
import * as crypto from "crypto";
import {
  CreateSubAccountData,
  CreateSubAccountResponse,
} from "./types/subAccount";

// Interface for constructor parameters
interface IPay100Config {
  publicKey: string;
  secretKey: string;
  baseUrl?: string;
}

// Interface for transaction data from API
interface ITransactionData {
  [key: string]: unknown; // For flexibility, since we don't know the exact structure
}

// Interface for raw API response
interface IRawApiResponse {
  status?: string;
  message?: string;
  data?: unknown;
  [key: string]: unknown;
}

// Interface for API success response
interface IVerifyResponse {
  status: "success" | "error";
  data: ITransactionData | Record<string, never>;
  message?: string;
}

const BASE_URL = process.env.BASE_URL || "https://api.100pay.co";

// Error type for payment verification
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

export class Pay100 {
  private publicKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor({ publicKey, secretKey, baseUrl = BASE_URL }: IPay100Config) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Creates a request signature for secure server-to-server communication
   * @param payload Request payload to sign
   * @returns Object containing timestamp and signature
   */
  private createSignature(payload: Record<string, unknown>): {
    timestamp: string;
    signature: string;
  } {
    const timestamp = Date.now().toString();

    // Create signature using HMAC SHA-256
    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(timestamp + JSON.stringify(payload))
      .digest("hex");

    return { timestamp, signature };
  }

  /**
   * Create common headers for API requests
   * @param additionalHeaders Additional headers to include
   * @param payload Payload to sign (if signature is needed)
   * @returns Headers object
   */
  private getHeaders(
    payload: Record<string, unknown> = {}
  ): Record<string, string> {
    // Generate signature based on payload
    const { timestamp, signature } = this.createSignature(payload);

    return {
      "api-key": this.publicKey,
      "x-secret-key": this.secretKey,
      "x-timestamp": timestamp,
      "x-signature": signature,
      "Content-Type": "application/json",
    };
  }

  /**
   * Verify a transaction
   * @param transactionId Transaction ID to verify
   * @returns Promise resolving to verification result
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
      // Handle Axios errors
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new PaymentVerificationError(
          axiosError.message ||
            "Something went wrong, be sure you supplied a valid payment id."
        );
      }

      // Handle other errors
      throw new PaymentVerificationError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  // subaccount methods
  subaccounts = {
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
   * Generic method to make authenticated API calls
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Request payload
   * @returns Promise resolving to API response
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
