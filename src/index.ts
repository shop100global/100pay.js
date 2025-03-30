import axios, { AxiosError, AxiosResponse } from "axios";

// Interface for constructor parameters
interface IPay100Config {
  publicKey: string;
  secretKey: string;
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

  constructor({ publicKey, secretKey }: IPay100Config) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
  }

  verify = async (transactionId: string): Promise<IVerifyResponse> => {
    try {
      const response: AxiosResponse<IRawApiResponse> = await axios({
        method: "POST",
        url: `https://api.100pay.co/api/v1/pay/crypto/payment/${transactionId}`,
        headers: {
          "api-key": this.publicKey,
        },
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
}
