import { z } from "zod";
import { writable, derived, type Writable, type Readable } from "svelte/store";
import { CaracteristicaEnum, type Caracteristica } from "$lib/schema/common/enums";
import { modifierIdentifier, type ModificadorAtributoInput } from "$lib/schema/common/basic_types";
import { addModifier, removeModifier } from "$lib/engine/common/attributes";
import { caracteristicaPrimaria, errorToString, type CaracteristicaPrimaria, type EngineWarnings } from "$lib/engine";
import { getSubSchemaFromAcxPath } from "./common";
import type { BaseOrTemporal } from "$lib/engine/common/enum";
import type { CaracteristicaPrimariaInput } from "$lib/schema/acx/characteristic";
import { mapGenerator } from "./common/utils";
import { putDiagnostic } from "./diagnostics";

// ---------------------------------------------------------------------------
// Initial state — all characteristics to base 5, no modifiers
// ---------------------------------------------------------------------------
const defaultCaracteristicaPrimaria: CaracteristicaPrimariaInput = {
  base: 5
}

// ---------------------------------------------------------------------------
// Private Store — exclusive writing from helpers
// ---------------------------------------------------------------------------
const _wcaracteristicas =
  mapGenerator<Caracteristica, Writable<CaracteristicaPrimariaInput>>(
    CaracteristicaEnum.options, () => writable(defaultCaracteristicaPrimaria)
  );
type WCaracteristicas = typeof _wcaracteristicas[keyof typeof _wcaracteristicas];

// ---------------------------------------------------------------------------
// Public derived Store — compute __ fields for each characteristic
// UI only reads this store, never the private one directly
// ---------------------------------------------------------------------------
export const caracteristicasStore =
  mapGenerator<Caracteristica, Readable<CaracteristicaPrimariaInput>>(
    CaracteristicaEnum.options, (caracteristica) => derived<WCaracteristicas, CaracteristicaPrimaria>(
      _wcaracteristicas[caracteristica],
      ($input, set) => {
        const [data, warns, err] = caracteristicaPrimaria(caracteristica, $input);
        putDiagnostic(caracteristica, {error: err, warnings: warns});

        if (err) return;
        if (data) set(data);
      }
    )
  );

// ---------------------------------------------------------------------------
// Mutation helpers — single point of access for writing to the store
// Each helper validates the zod schema before passing it to the engine
// ---------------------------------------------------------------------------

/**
 * Sets the base value of característica primaria.
 * rawValue comes from HTML input — it could be string or number.
 */
export function setBase(caracteristica: Caracteristica, rawValue: unknown) {
  // Validation from Zod — single point of truth
  const schema = getSubSchemaFromAcxPath(`personaje/caracteristicas_primarias/${caracteristica}/base`);
  if (!schema) {
    // Surface validation error to UI
    console.warn(`Invalid schema for ${caracteristica}.base`);
    return;
  }

  const coercedSchema = z.coerce.number().pipe(schema);
  if (!coercedSchema) {
    // Surface validation error to UI
    console.warn(`Invalid schema for ${caracteristica}.base`);
    return;
  }

  const parsed = coercedSchema.safeParse(rawValue);
  if (!parsed.success) {
    // Surface validation error to UI
    console.warn(`${caracteristica}.base inválido: `, parsed.error.issues[0].message);
    return;
  }

  _wcaracteristicas[caracteristica].update((c) => ({
    ...c,
    base: parsed.data,
  }));
}

/**
 * Removed old and add new modifier to característica primaria
 */
export function updateCaracteristicaModifier(
  caracteristica: Caracteristica,
  tipo:           BaseOrTemporal,
  oldMod?:        ModificadorAtributoInput,
  newMod?:        ModificadorAtributoInput,
) {
  _wcaracteristicas[caracteristica].update((c) => {
    let warns : EngineWarnings = [];
    let nextState = c;

    if (oldMod) {
      const oldKey = modifierIdentifier(oldMod);

      const [afterRemove, rWarn, rErr] = removeModifier(c, oldKey);
      if (rErr || !afterRemove) {
        console.error(`removeModifier ${caracteristica}:`, errorToString(rErr));
        return c; // no mutation on error
      }
      if (rWarn) warns.push(...rWarn);

      nextState = afterRemove as typeof c;
    }

    if (newMod) {
      const [afterAdd, aWarn, aErr] = addModifier(nextState, tipo, newMod);
      if (aErr) {
        console.warn(`addModifier ${caracteristica}:`, errorToString(aErr));
        return c; // no mutation on error
      }
      if (aWarn) warns.push(...aWarn);

      nextState = afterAdd as typeof c;
    }

    const [final, fWarn, fErr] = caracteristicaPrimaria(
      caracteristica,
      nextState as unknown as CaracteristicaPrimariaInput);
    if (fErr) {
      console.warn(`addModifier ${caracteristica}:`, errorToString(fErr));
      return c; // no mutation on error
    }
    if (fWarn) warns.push(...fWarn);

    return final as typeof c;
  });
}

/**
 * Sum the base of all attributes
 */
export const sumaBases = derived(
  Object.values(caracteristicasStore),
  ($caracteristica) => {
    return $caracteristica.reduce(
      (acc, curr) => acc + (curr.base || 0), 0);
  }
);