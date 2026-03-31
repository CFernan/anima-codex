import type {
  AtributoFlexible,
  AtributoDirecto,
  AtributoPD,
  AtributoCalculado,
  ModificadorAtributo,
  ModificadorAtributoInput,
} from "$lib/schema/common/basic_types";
import {
  makeModifier,
  modifierKey,
} from "$lib/schema/common/basic_types";
import { EngineErrorCode, type EngineResult, type EngineWarnings, type Nullable } from "./common/engine_result";


// ---------------------------------------------------------------------------
// Runtime type guards
// ---------------------------------------------------------------------------
/**
 * Casts the modifier array from the Zod-inferred type to the runtime
 * ModificadorAtributo type (which carries _key).
 *
 * Safe post-load boundary: modifier arrays are always hydrated via
 * makeModifier before the engine operates on them. The cast is
 * intentional and documented here as the single authorised crossing point.
 */
function asRuntimeMods(
  arr: Nullable<ModificadorAtributo[]>,
): ModificadorAtributo[] {
  return (arr as ModificadorAtributo[]) ?? [];
}


// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
/**
 * Finds the next available description for an automatic modifier when a
 * key collision is detected. Appends " (2)", " (3)", etc. to descripcion
 * until a free key is found in the target array.
 */
function nextAvailableDescription(
  existing: ModificadorAtributo[],
  m:        ModificadorAtributoInput,
): string {
  const base = m.descripcion ?? "";
  let n = 2;
  while (true) {
    const candidate = base ? `${base} (${n})` : `(${n})`;
    const testKey   = modifierKey({ ...m, descripcion: candidate });
    if (!existing.some(e => e._key === testKey)) return candidate;
    n++;
  }
}


// ---------------------------------------------------------------------------
// Modifier sum
// ---------------------------------------------------------------------------
export type sumCondition = (modificador: ModificadorAtributo, accumulated: number) => Boolean;

/**
 * Sums all modifier values in O(n). An absent or empty array yields 0 — not
 * an error, since having no modifiers is a valid state for any attribute.
 * Optional argument condition acepts a closure to accumulate or not the total
 * given the current ModificadorAtributo and current total.
 * * @example: sumModifiers(mods, (_, t) => t < 100)
 */
export function sumModifiers(
  arr: Nullable<ModificadorAtributo[]>,
  condition: sumCondition = () => true,
): EngineResult<number> {
  const mods  = asRuntimeMods(arr);
  let   total = 0;
  for (const m of mods) {
    if (condition(m, total)) {
      total += m.valor;
    }
  }
  return [total, null, null];
}


// ---------------------------------------------------------------------------
// Base value computation
//
// Each function sets __base_calculada on the attribute in place.
// The three functions correspond to the three attribute types:
//   AtributoDirecto   → __base_calculada = attr.base
//   AtributoPD        → __base_calculada = attr.pd / cost
//   AtributoCalculado → __base_calculada = transform()
//
// computeFinal must be called after one of these functions.
// ---------------------------------------------------------------------------

/**
 * Sets __base_calculada on an AtributoDirecto.
 * base_calculada equals attr.base — the user-assigned value.
 */
export function baseAtributoDirecto(
  attr: Nullable<AtributoDirecto>,
): EngineResult<AtributoDirecto> {
  if (!attr) return [ null, null,
    {
      code:    EngineErrorCode.UNDEFINED_ATTRIBUTE,
      message: "El atributo es null o undefined",
    }];

  attr.__base_calculada = attr.base;
  return [attr, null, null];
}

/**
 * Sets __base_calculada on an AtributoPD from a cost-per-point value.
 * base_calculada = attr.pd / cost.
 *
 * Fails if:
 *   · cost is not a positive integer
 *   · attr.pd is not an exact multiple of cost
 */
export function baseAtributoPD(
  attr: Nullable<AtributoPD>,
  cost: number,
): EngineResult<AtributoPD> {
  if (!attr) return [ null, null,
    {
      code:    EngineErrorCode.UNDEFINED_ATTRIBUTE,
      message: "El atributo es null o undefined",
    }];

  if (typeof cost !== "number") return [ null, null,
    {
      code:    EngineErrorCode.INVALID_TYPE,
      message: "Coste debe ser un número",
    }];

  // Bitwise integer check: (cost | 0) forces 32-bit int conversion.
  // If it doesn't match, cost is a float, NaN, or Infinity.
  if (cost <= 0 || (cost | 0) !== cost) return [null, null,
    {
      code:    EngineErrorCode.INVALID_BOUNDS,
      message: `Coste debe ser un entero positivo, recibido: ${cost}`,
    }];

  if (attr.pd % cost !== 0) return [null, null,
    {
      code:    EngineErrorCode.CONSTRAINT_NOT_MATCHED,
      message: `PD (${attr.pd}) no es múltiplo de cost (${cost})`,
    }];

  attr.__base_calculada = attr.pd / cost;
  return [attr, null, null];
}

/**
 * Sets __base_calculada on an AtributoCalculado using a transform closure.
 *
 * The closure is provided by the calling engine and encapsulates all upstream
 * dependencies (e.g. `() => finalBase(agi)` for tipo_movimiento).
 * This keeps baseAttributeComputed free of catalog or character knowledge.
 *
 * Fails if:
 *   · transform is not a function
 *   · transform returns a non-integer (NaN, Infinity, float)
 */
export function baseAtributoCalculado(
  attr:      Nullable<AtributoCalculado>,
  transform: () => number,
): EngineResult<AtributoCalculado> {
  if (!attr) return [null, null,
    {
      code:    EngineErrorCode.UNDEFINED_ATTRIBUTE,
      message: "El atributo es null o undefined",
    }];

  if (typeof transform !== "function") return [null, null,
    {
      code:    EngineErrorCode.INVALID_TYPE,
      message: "transform debe ser una función",
    }];

  const output = transform();
  if (typeof output !== "number" || (output | 0) !== output) return [null, null,
    {
      code:    EngineErrorCode.INVALID_TYPE,
      message: `transform debe devolver un entero, devolvió: ${output}`,
    }];

  attr.__base_calculada = output;
  return [attr, null, null];
}


// ---------------------------------------------------------------------------
// Final value computation
// ---------------------------------------------------------------------------

/**
 * Computes __final_base and __final_temporal from __base_calculada and the
 * modifier arrays. Sets both fields in place.
 *
 *   __final_base     = __base_calculada + sum(modificadores_base)
 *   __final_temporal = __final_base     + sum(modificadores_temporales)
 *
 * Precondition: __base_calculada must already be set by one of the
 * baseAttribute* functions above. Fails immediately if absent.
 *
 * This function is deliberately unaware of:
 *   · Drift detection (US-34) — responsibility of engine/drift.ts at load time
 *   · Rule limit checks       — responsibility of the calling engine layer
 */
export function finalAtributo<T extends AtributoFlexible>(
  attr: Nullable<T>,
): EngineResult<T> {
  if (!attr) return [null, null,
    {
      code:    EngineErrorCode.UNDEFINED_ATTRIBUTE,
      message: "El atributo es null o undefined",
    }];

  if (attr.__base_calculada === undefined || attr.__base_calculada === null) return [null, null,
    {
      code:    EngineErrorCode.MISSING_BASE_CALCULADA,
      message: "__base_calculada debe estar calculado antes de llamar a computeFinal",
    }];

  const [baseSum, baseWarn, baseErr] = sumModifiers(attr.modificadores_base as ModificadorAtributo[]);
  if (baseErr) return [null, null, baseErr];

  const [tempSum, tempWarn, tempErr] = sumModifiers(attr.modificadores_temporales as ModificadorAtributo[]);
  if (tempErr) return [null, null, tempErr];

  attr.__final_base     = attr.__base_calculada + baseSum!;
  attr.__final_temporal = attr.__final_base     + tempSum!;

  let totalWarnings: EngineWarnings = null;
  if (baseWarn && tempWarn) {
    totalWarnings = [...baseWarn, ...tempWarn];
  } else {
    totalWarnings = baseWarn ?? tempWarn;
  }
  return [attr, totalWarnings, null];
}


// ---------------------------------------------------------------------------
// Modifier mutation — pure, always return new attribute objects
// ---------------------------------------------------------------------------

/**
 * Returns a new attribute with the modifier appended to the specified array.
 *
 * Collision handling:
 *   · Manual modifier (no __automatico): fails with DUPLICATE_MODIFIER_KEY
 *     if an entry with the same key already exists.
 *   · Automatic modifier (__automatico: true): appends a numeric suffix to
 *     descripcion (" (2)", " (3)", ...) until a free key is found.
 *
 * The modifier is hydrated via makeModifier before insertion, ensuring
 * _key is always consistent with the stored field values.
 */
export function addModifier(
  attr:     Nullable<AtributoFlexible>,
  tipo:     "base" | "temporal",
  modInput: ModificadorAtributoInput,
): EngineResult<AtributoFlexible> {
  if (!attr) return [null, null,
    {
      code:    EngineErrorCode.UNDEFINED_ATTRIBUTE,
      message: "El atributo es null o undefined",
    }];

  const targetArray = tipo === "base"
    ? asRuntimeMods(attr.modificadores_base as ModificadorAtributo[])
    : asRuntimeMods(attr.modificadores_temporales as ModificadorAtributo[]);

  let modifier: ModificadorAtributo = makeModifier(modInput);

  const key       = modifierKey(modifier);
  const collision = targetArray.some(m => m._key === key);

  if (collision) {
    if (!modifier.__automatico) {
      return [null, null, {
        code:    EngineErrorCode.DUPLICATE_MODIFIER_KEY,
        message: `Ya existe un modificador con clave "${key}" en modificadores_${tipo}`,
      }];
    }
    // Automatic modifier: find a free description suffix and re-hydrate
    const newDesc = nextAvailableDescription(targetArray, modifier);
    modifier      = makeModifier({ ...modifier, descripcion: newDesc });
  }

  if (tipo === "base") {
    return [{ ...attr, modificadores_base: [...targetArray, modifier] }, null, null];
  }
  return [{ ...attr, modificadores_temporales: [...targetArray, modifier] }, null, null];
}

/**
 * Returns a new attribute with all modifiers matching the given _key removed
 * from both arrays simultaneously.
 *
 * Operates on the exact _key — not on fuente alone. Use mergeModifiers
 * (engine/modifiers.ts, US-11) when you need to replace all automatic
 * modifiers from a given source.
 *
 * Is a no-op if no modifier with that key exists.
 */
export function removeModifier(
  attr: Nullable<AtributoFlexible>,
  key:  string,
): EngineResult<AtributoFlexible> {
  if (!attr) return [null, null,
    {
      code:    EngineErrorCode.UNDEFINED_ATTRIBUTE,
      message: "El atributo es null o undefined",
    }];

  return [
    {
      ...attr,
      modificadores_base:       asRuntimeMods(attr.modificadores_base as ModificadorAtributo[]).filter(m => m._key !== key),
      modificadores_temporales: asRuntimeMods(attr.modificadores_temporales as ModificadorAtributo[]).filter(m => m._key !== key),
    },
    null,
    null];
}
