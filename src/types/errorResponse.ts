interface ValidationErrorDetail {
  type: string;
  loc: (string | number)[];
  msg: string;
  input: unknown;
  ctx: Record<string, unknown>;
}

// Универсальный тип для ответа с ошибкой
export interface ErrorResponse {
  detail: string | ValidationErrorDetail[];
}
