export interface ApiFieldError {
  code: string;
  message: string;
  field?: string;
}

export class ApiClientError extends Error {
  status?: number;
  errors: ApiFieldError[];

  constructor(message: string, status?: number, errors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }

  get fieldErrors() {
    return this.errors.reduce<Record<string, string>>((acc, error) => {
      if (error.field) acc[error.field] = error.message;
      return acc;
    }, {});
  }
}
