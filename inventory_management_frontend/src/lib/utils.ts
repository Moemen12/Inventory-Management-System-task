import { ErrorRes, ErrorResult } from "@/types";
import { clsx, type ClassValue } from "clsx";
import ky from "ky";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function handleApiError(
  error: unknown,
  defaultMessage = "An unexpected error occurred"
): Promise<ErrorResult> {
  // Handle Ky errors
  if (error instanceof Error && "response" in error) {
    try {
      const httpError = error as { response: Response };
      const errorData = (await httpError.response.json()) as ErrorRes;

      return {
        success: false,
        message: getFirstErrorMessage(errorData.errors) || defaultMessage,
        errors: errorData.errors,
        status: errorData.status,
      };
    } catch {
      // Failed to parse JSON from Ky error
      return {
        success: false,
        message: "Could not parse error response",
      };
    }
  }

  // Handle network errors
  if (error instanceof Error && error.message.includes("network")) {
    return {
      success: false,
      message: "Network error. Please check your connection.",
    };
  }

  // Generic error fallback
  return {
    success: false,
    message: error instanceof Error ? error.message : defaultMessage,
  };
}

function getFirstErrorMessage(
  errors?: Record<string, string[]>
): string | undefined {
  if (!errors) return undefined;

  // Get all error messages flattened into a single array
  const errorMessages = Object.values(errors).flat();

  // Return the first error message if it exists
  return errorMessages.length > 0 ? errorMessages[0] : undefined;
}

export function getAllErrorMessages(
  errors?: Record<string, string[]>
): string[] {
  if (!errors) return [];
  return Object.values(errors).flat();
}

export const customKy = ky.create({
  hooks: {
    afterResponse: [
      async (_, __, response) => {
        if (response.status === 401) {
          window.location.href = "/";
        }
        return response;
      },
    ],
  },
});
