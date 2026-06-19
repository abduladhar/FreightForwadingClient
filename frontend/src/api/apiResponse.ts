export interface ApiResponse<T> {
  success: boolean;
  messageKey?: string;
  message?: string;
  data: T;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  nextCursor?: string | null;
  isCursorPage?: boolean;
}
