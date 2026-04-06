import type { CaracteristicaPrimariaInput } from "$lib/schema/acx/characteristic";
import type { AtributoDirecto } from "$lib/schema/common/basic_types";
import type { Caracteristica } from "$lib/schema/common/enums";
import { baseAtributoDirecto, finalAtributo } from "../common/attributes";
import { errorToString, type EngineResult, type EngineWarnings } from "../common/engine_result";
import { EngineErrorCode, EngineWarningCode } from "../common/enum";

const TABLE_CHARACTERISTICS_MODIFIERS = [
  // Index is the characteristic value
  NaN, // 0
  -30, // 1
  -20, // 2
  -10, // 3
  -5,  // 4
  0,   // 5
  +5,  // 6
  +5,  // 7
  +10, // 8
  +10, // 9
  +15, // 10
  +20, // 11
  +20, // 12
  +25, // 13
  +25, // 14
  +30, // 15
  +35, // 16
  +35, // 17
  +40, // 18
  +40, // 19
  +45, // 20
]

export type CaracteristicaPrimaria = AtributoDirecto & {
  _bono_base:           number;  /** Bonus derived from __final_base */
  _delta_bono_temporal: number;  /** Additional bonus derived from __final_temporal on top of _bono_base */
};
export type CaracteristicasPrimarias = Record<Caracteristica, CaracteristicaPrimaria>;

export function bonoCaracteristicaPrimaria(
  attr: CaracteristicaPrimaria,
): EngineResult<CaracteristicaPrimaria> {
  if (!attr) return [null, null,
    {
      code: EngineErrorCode.UNDEFINED_ATTRIBUTE,
      message: `Atributo no definido`,
    }]

  let warns : EngineWarnings = [];

  if (attr.base > 10) {
    warns.push({
      code: EngineWarningCode.CONSTRAINT_NOT_MATCHED,
      message: `base no debe ser mayor a 10, recibido: ${attr.base}`,
    });
  }

  const indexBase = (attr.__final_base ?? 0) | 0;
  const indexTemporal = (attr.__final_temporal ?? 0) | 0;

  if (indexBase <= 0 || indexBase > 20) return [null, null,
    {
      code: EngineErrorCode.INVALID_BOUNDS,
      message: `__final_base Debe ser un entero entre 1 y 20, recibido: ${indexBase}`,
    }];

  if (indexTemporal <= 0 || indexTemporal > 20) return [null, null,
    {
      code: EngineErrorCode.INVALID_BOUNDS,
      message: `__final_temporal Debe ser un entero entre 1 y 20, recibido: ${indexTemporal}`,
    }];

  attr._bono_base = TABLE_CHARACTERISTICS_MODIFIERS[indexBase];
  attr._delta_bono_temporal = TABLE_CHARACTERISTICS_MODIFIERS[indexTemporal] - attr._bono_base;

  return [attr, warns.length > 0 ? warns : null, null]
}

export function caracteristicaPrimaria(name: string, input: CaracteristicaPrimariaInput): EngineResult<CaracteristicaPrimaria> {
    const attr = input;
    let warns : EngineWarnings = [];
    const [bAttr, bWarn, bErr] = baseAtributoDirecto(attr);
    if (bErr) {
      // Surface to UI — to errors store
      console.error(`Error en ${name}: `, errorToString(bErr));
      return [null, null, bErr];
    }
    if (bWarn) warns.push(...bWarn);

    const [fAttr, fWarns, fErr] = finalAtributo(bAttr);
    if (fErr) {
      console.error(`Error calculando final de ${name}: `, errorToString(fErr));
      return [null, null, fErr];
    }
    if (fWarns) warns.push(...fWarns);

    const [computed, bcWarns, bcErr] = bonoCaracteristicaPrimaria(fAttr as CaracteristicaPrimaria);
    if (bcErr) {
      console.error(`Error calculando bonos de ${name}: `, errorToString(bcErr));
      return [null, null, bcErr];
    }
    if (bcWarns) warns.push(...bcWarns);

    // warns could go to warnings stores in US-34
    for (const w of warns) {
      console.error(`Warning en ${name}: `, w?.message);
    }

  return [computed, warns, null];
}
