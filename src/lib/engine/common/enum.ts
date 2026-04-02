
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
  CONSTRAINT_NOT_MATCHED,
}

// ---------------------------------------------------------------------------
// Others
// ---------------------------------------------------------------------------
export const enum BaseOrTemporal {
  BASE,
  TEMPORAL,
}
