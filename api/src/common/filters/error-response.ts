import { HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  status_code: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

interface BuildErrorResponseParams {
  status: number;
  message: string | string[];
  path: string;
  error?: string;
}

export function buildErrorResponse(
  params: BuildErrorResponseParams,
): ErrorResponse {
  return {
    status_code: params.status,
    error: params.error ?? reasonPhrase(params.status),
    message: params.message,
    path: params.path,
    timestamp: new Date().toISOString(),
  };
}

function reasonPhrase(status: number): string {
  const key = HttpStatus[status];
  if (!key) return 'Error';
  return key
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
