import type { CaracteristicaPrimaria } from "$lib/schema/acx/characteristic";
import { type EngineResult } from "../common/engine_result";
import { EngineErrorCode } from "../common/enum";

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

export function bonoCaracteristicaPrimaria(
  attr: CaracteristicaPrimaria,
): EngineResult<CaracteristicaPrimaria> {
  if (!attr) return [null, null,
    {
      code: EngineErrorCode.UNDEFINED_ATTRIBUTE,
      message: `Atributo no definido`,
    }]

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

  return [attr, null, null]
}
