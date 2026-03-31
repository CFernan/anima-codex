
// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export const enum EngineErrorCode {
  UNDEFINED_ATTRIBUTE,
  INVALID_TYPE,
  INVALID_BOUNDS,
  CONSTRAINT_NOT_MATCHED,
  MISSING_BASE_CALCULADA,
  DUPLICATE_MODIFIER_KEY,
}

// ---------------------------------------------------------------------------
// Warning codes
// ---------------------------------------------------------------------------

export const enum EngineWarningCode {
  // No warning defined yet
}

// ---------------------------------------------------------------------------
// Diagnostic types
// ---------------------------------------------------------------------------
export type Nullable<T> = T | null | undefined;

export type EngineError = Nullable<{
  readonly code: EngineErrorCode;
  readonly message: string;
}>;

export type EngineWarning = Nullable<{
  readonly code: EngineWarningCode;
  readonly message: string;
}>;

export type EngineWarnings = Nullable<EngineWarning[]>;

export function errorToString(error: EngineError): string {
  if (!error) return "";
  return `[${error.code}] ${error.message}`;
}

export function warningToString(warning: EngineWarning): string {
  if (!warning) return "";
  return `[${warning.code}] ${warning.message}`;
}

export function warningsToString(warnings: EngineWarning[]): string {
  if (!warnings || warnings.length === 0) return "";
  return warnings.map(warningToString).join("\n");
}

// ---------------------------------------------------------------------------
// Result type — tuple
//
// Success, no warnings  : [value, null,     null ]
// Success, with warnings: [value, warnings, null ]
// Error                 : [null,  null,     error]
// ---------------------------------------------------------------------------
export type EngineResult<T> = readonly [
  Nullable<T>,
  EngineWarnings,
  EngineError
];
