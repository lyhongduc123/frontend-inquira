/**
 * Standard API response wrapper types
 * Matches backend ApiResponse structure
 */

export enum ErrorCode {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  CONFLICT = "CONFLICT",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

export interface ErrorDetail {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ErrorDetail | null;
  timestamp: string;
  request_id: string | null;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface DeleteResponse {
  message: string;
}

/**
 * Helper to extract data from API response
 */
export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    const error = response.error || {
      code: ErrorCode.INTERNAL_ERROR,
      message: "Unknown error occurred",
    };
    throw new ApiError(error.message, error.code, error.details);
  }
  return response.data;
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}
