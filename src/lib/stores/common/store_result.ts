import type { EngineResult } from "$lib/engine";

export type StoreResult<T> = Record<string, EngineResult<T>>;