import { describe, it, expect } from "vitest";
import {
  sumModifiers,
  baseAtributoDirecto,
  baseAtributoPD,
  baseAtributoCalculado,
  finalAtributo,
  addModifier,
  removeModifier,
  type constraintCondition,
} from "$lib/engine/attributes";
import {
  makeModifier,
  modifierKey,
} from "$lib/schema/common/basic_types";
import type {
  AtributoDirecto,
  AtributoPD,
  AtributoCalculado,
  ModificadorAtributo,
  ModificadorAtributoInput,
  AtributoFlexible,
} from "$lib/schema/common/basic_types";
import { assertError, assertOk, assertOkWarnings } from "../helpers/test-helpers";
import { BaseOrTemporal, EngineErrorCode, EngineWarningCode } from "$lib/engine/common/enum";
import { errorToString } from "$lib/engine";


// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mod = (
  fuente:       string,
  valor:        number,
  descripcion?: string,
  automatico?:  boolean,
): ModificadorAtributo =>
  makeModifier({ fuente, valor, descripcion, __automatico: automatico });

const modInput = (
  fuente:       string,
  valor:        number,
  descripcion?: string,
  automatico?:  boolean,
): ModificadorAtributoInput =>
  ({ fuente, valor, descripcion, __automatico: automatico });

/** Builds an AtributoDirecto. Modifier arrays cast to runtime type. */
const directo = (
  base:      number,
  baseMods:  ModificadorAtributo[] = [],
  tempMods:  ModificadorAtributo[] = [],
): AtributoDirecto => ({
  base,
  modificadores_base:       baseMods as any,
  modificadores_temporales: tempMods as any,
});

/** Builds an AtributoPD. Modifier arrays cast to runtime type. */
const pdAttr = (
  pd:       number,
  baseMods: ModificadorAtributo[] = [],
  tempMods: ModificadorAtributo[] = [],
): AtributoPD => ({
  pd,
  modificadores_base:       baseMods as any,
  modificadores_temporales: tempMods as any,
});

/** Builds an AtributoCalculado. Modifier arrays cast to runtime type. */
const calculado = (
  baseMods: ModificadorAtributo[] = [],
  tempMods: ModificadorAtributo[] = [],
): AtributoCalculado => ({
  modificadores_base:       baseMods as any,
  modificadores_temporales: tempMods as any,
});

/** Builds an AtributoDirecto with __base_calculada already set. */
const directoConBase = (
  base:          number,
  baseCalculada: number,
  baseMods:      ModificadorAtributo[] = [],
  tempMods:      ModificadorAtributo[] = [],
): AtributoDirecto => ({
  ...directo(base, baseMods, tempMods),
  __base_calculada: baseCalculada,
});

const constraintBase: constraintCondition<number> =
  (b) => {
    if (b > 30) {
      return [null, null, {code: EngineErrorCode.CONSTRAINT_NOT_MATCHED, message: ""}];
    }
    else if (b > 20) {
      return [20, [{code: EngineWarningCode.CONSTRAINT_NOT_MATCHED, message: ""}], null];
    }

    return [b, null, null];
  };


// ===========================================================================
// sumModifiers
// ===========================================================================

describe("sumModifiers", () => {
  it("returns 0 for null",                   () => assertOk(sumModifiers(null), 0));
  it("returns 0 for undefined",              () => assertOk(sumModifiers(undefined), 0));
  it("returns 0 for empty array",            () => assertOk(sumModifiers([]), 0));

  it("sums a single positive modifier",      () => assertOk(sumModifiers([mod("Raza", 5)]), 5));
  it("sums a single negative modifier",      () => assertOk(sumModifiers([mod("Herida", -3)]), -3));
  it("sums multiple modifiers",              () => {
    assertOk(sumModifiers([mod("A", 5), mod("B", 3), mod("C", -2)]),
             6);
  });
  it("sums to zero when positives and negatives cancel", () => {
    assertOk(sumModifiers([mod("A", 5), mod("B", -5)]),
             0);
  });

  it("sums given modifier condition", () => {
    assertOk(sumModifiers([
                            mod("A", 5),
                            mod("A", 10),
                            mod("B", -20)
                          ],
                          (m, _) => m.fuente == "A"),
            15);
  });

  it("sums given accumulated condition", () => {
    assertOk(sumModifiers([
                            mod("A", 5),
                            mod("A", 10),
                            mod("B", -20)
                          ],
                          (_, t) => t < 5),
            5);
  });

  it("sums given modifier and accumulated condition", () => {
    assertOk(sumModifiers([
                            mod("A", 5),
                            mod("A", -20),
                            mod("B", 10)
                          ],
                          (m, t) => t >= 0 && m.valor <= 5),
            -15);
  });
});


// ===========================================================================
// baseAtributoDirecto
// ===========================================================================

describe("baseAtributoDirecto", () => {
  it("returns UNDEFINED_ATTRIBUTE for null",      () => assertError(baseAtributoDirecto(null), EngineErrorCode.UNDEFINED_ATTRIBUTE));
  it("returns UNDEFINED_ATTRIBUTE for undefined", () => assertError(baseAtributoDirecto(undefined), EngineErrorCode.UNDEFINED_ATTRIBUTE));

  it("sets __base_calculada to base", () => {
    const [attr, , ] = baseAtributoDirecto(directo(10));
    expect(attr?.__base_calculada).toBe(10);
  });

  it("sets __base_calculada for base = 1 (minimum positiveInt)", () => {
    const [attr, , ] = baseAtributoDirecto(directo(1));
    expect(attr?.__base_calculada).toBe(1);
  });

  it("ignores modifier arrays when computing __base_calculada", () => {
    const [attr, , ] = baseAtributoDirecto(directo(10, [mod("Raza", 5)]));
    expect(attr?.__base_calculada).toBe(10); // not 15
  });

  it("preserves existing modifier arrays", () => {
    const baseMods = [mod("Raza", 5)];
    const tempMods = [mod("Hechizo", 3)];
    const [attr, , ] = baseAtributoDirecto(directo(10, baseMods, tempMods));
    expect(attr?.modificadores_base).toEqual(baseMods);
    expect(attr?.modificadores_temporales).toEqual(tempMods);
  });

  it("constaint applied with no warns or errors", () => {
    assertOk(baseAtributoDirecto(directo(10), constraintBase),
             {base: 10, __base_calculada: 10, modificadores_base: [], modificadores_temporales: []});
  });

  it("constaint applied with warns", () => {
    assertOkWarnings(baseAtributoDirecto(directo(25), constraintBase),
                     {base: 25, __base_calculada: 20, modificadores_base: [], modificadores_temporales: []},
                     [EngineWarningCode.CONSTRAINT_NOT_MATCHED]);
  });

  it("constaint applied with errors", () => {
    assertError(baseAtributoDirecto(directo(40), constraintBase), EngineErrorCode.CONSTRAINT_NOT_MATCHED);
  });
});


// ===========================================================================
// baseAttributePd
// ===========================================================================

describe("baseAttributePd", () => {
  it("returns UNDEFINED_ATTRIBUTE for null attr",      () => assertError(baseAtributoPD(null, 2), EngineErrorCode.UNDEFINED_ATTRIBUTE));
  it("returns UNDEFINED_ATTRIBUTE for undefined attr", () => assertError(baseAtributoPD(undefined, 2), EngineErrorCode.UNDEFINED_ATTRIBUTE));

  it("returns INVALID_TYPE for string cost",   () => assertError(baseAtributoPD(pdAttr(50), "2" as any), EngineErrorCode.INVALID_TYPE));
  it("returns INVALID_TYPE for NaN cost",      () => assertError(baseAtributoPD(pdAttr(50), NaN), EngineErrorCode.INVALID_BOUNDS));
  it("returns INVALID_TYPE for Infinity cost", () => assertError(baseAtributoPD(pdAttr(50), Infinity), EngineErrorCode.INVALID_BOUNDS));
  it("returns INVALID_TYPE for float cost",    () => assertError(baseAtributoPD(pdAttr(50), 1.5), EngineErrorCode.INVALID_BOUNDS));

  it("returns INVALID_BOUNDS for cost = 0",    () => assertError(baseAtributoPD(pdAttr(50), 0), EngineErrorCode.INVALID_BOUNDS));
  it("returns INVALID_BOUNDS for cost < 0",    () => assertError(baseAtributoPD(pdAttr(50), -1), EngineErrorCode.INVALID_BOUNDS));

  it("returns CONSTRAINT_NOT_MATCHED when pd is not multiple of cost", () => {
    assertError(baseAtributoPD(pdAttr(51), 2), EngineErrorCode.CONSTRAINT_NOT_MATCHED);
  });

  it("sets __base_calculada = pd / cost",    () => {
    const [attr, , ] = baseAtributoPD(pdAttr(50), 2);
    expect(attr?.__base_calculada).toBe(25);
  });

  it("sets __base_calculada = 0 when pd = 0", () => {
    const [attr, , ] = baseAtributoPD(pdAttr(0), 2);
    expect(attr?.__base_calculada).toBe(0);
  });

  it("works with cost = 1",                  () => {
    const [attr, , ] = baseAtributoPD(pdAttr(100), 1);
    expect(attr?.__base_calculada).toBe(100);
  });

  it("preserves modifier arrays",            () => {
    const baseMods = [mod("Categoria", 5)];
    const [attr, , ] = baseAtributoPD(pdAttr(50, baseMods), 2);
    expect(attr?.modificadores_base).toEqual(baseMods);
  });

  it("constaint applied with no warns or errors", () => {
    assertOk(baseAtributoPD(pdAttr(10), 2, constraintBase),
             {pd: 10, __base_calculada: 5, modificadores_base: [], modificadores_temporales: []});
  });

  it("constaint applied with warns", () => {
    assertOkWarnings(baseAtributoPD(pdAttr(42), 2, constraintBase),
                     {pd: 42, __base_calculada: 20, modificadores_base: [], modificadores_temporales: []},
                     [EngineWarningCode.CONSTRAINT_NOT_MATCHED]);
  });

  it("constaint applied with errors", () => {
    assertError(baseAtributoPD(pdAttr(80), 2, constraintBase), EngineErrorCode.CONSTRAINT_NOT_MATCHED);
  });
});


// ===========================================================================
// baseAttributeComputed
// ===========================================================================

describe("baseAttributeComputed", () => {
  it("returns UNDEFINED_ATTRIBUTE for null attr",      () => assertError(baseAtributoCalculado(null, () => 10), EngineErrorCode.UNDEFINED_ATTRIBUTE));
  it("returns UNDEFINED_ATTRIBUTE for undefined attr", () => assertError(baseAtributoCalculado(undefined, () => 10), EngineErrorCode.UNDEFINED_ATTRIBUTE));

  it("returns INVALID_TYPE for non-function transform", () => {
    assertError(baseAtributoCalculado(calculado(), 42 as any), EngineErrorCode.INVALID_TYPE);
  });

  it("returns INVALID_TYPE when transform returns float",    () => assertError(baseAtributoCalculado(calculado(), () => 1.5), EngineErrorCode.INVALID_TYPE));
  it("returns INVALID_TYPE when transform returns NaN",      () => assertError(baseAtributoCalculado(calculado(), () => NaN), EngineErrorCode.INVALID_TYPE));
  it("returns INVALID_TYPE when transform returns Infinity", () => assertError(baseAtributoCalculado(calculado(), () => Infinity), EngineErrorCode.INVALID_TYPE));

  it("sets __base_calculada to transform output", () => {
    const [attr, , ] = baseAtributoCalculado(calculado(), () => 12);
    expect(attr?.__base_calculada).toBe(12);
  });

  it("sets __base_calculada to 0", () => {
    const [attr, , ] = baseAtributoCalculado(calculado(), () => 0);
    expect(attr?.__base_calculada).toBe(0);
  });

  it("sets __base_calculada to negative value", () => {
    const [attr, , ] = baseAtributoCalculado(calculado(), () => -5);
    expect(attr?.__base_calculada).toBe(-5);
  });

  it("transform closure captures external values correctly", () => {
    const agi = directo(10, [mod("Raza", 2)]);
    // simulates tipo_movimiento = __final_base(agi)
    const [agiResult] = baseAtributoDirecto(agi);
    const [attr, , ] = baseAtributoCalculado(
      calculado(),
      () => (agiResult?.__base_calculada ?? 0) + sumModifiers(agiResult?.modificadores_base as any)[0]!
    );
    expect(attr?.__base_calculada).toBe(12);
  });

  it("constaint applied with no warns or errors", () => {
    assertOk(baseAtributoCalculado(calculado(), () => 10, constraintBase),
             {__base_calculada: 10, modificadores_base: [], modificadores_temporales: []});
  });

  it("constaint applied with warns", () => {
    assertOkWarnings(baseAtributoCalculado(calculado(), () => 22, constraintBase),
                     {__base_calculada: 20, modificadores_base: [], modificadores_temporales: []},
                     [EngineWarningCode.CONSTRAINT_NOT_MATCHED]);
  });

  it("constaint applied with errors", () => {
    assertError(baseAtributoCalculado(calculado(), () => 40, constraintBase), EngineErrorCode.CONSTRAINT_NOT_MATCHED);
  });
});


// ===========================================================================
// computeFinal
// ===========================================================================

describe("computeFinal", () => {
  it("returns UNDEFINED_ATTRIBUTE for null",      () => assertError(finalAtributo(null), EngineErrorCode.UNDEFINED_ATTRIBUTE));
  it("returns UNDEFINED_ATTRIBUTE for undefined", () => assertError(finalAtributo(undefined), EngineErrorCode.UNDEFINED_ATTRIBUTE));

  it("returns MISSING_BASE_CALCULADA when __base_calculada is undefined", () => {
    assertError(finalAtributo(directo(10)), EngineErrorCode.MISSING_BASE_CALCULADA);
  });

  it("returns MISSING_BASE_CALCULADA when __base_calculada is null", () => {
    assertError(finalAtributo({ ...directo(10), __base_calculada: null as any }), EngineErrorCode.MISSING_BASE_CALCULADA);
  });

  it("sets __final_base = __base_calculada when no base modifiers", () => {
    const [attr, , ] = finalAtributo(directoConBase(10, 10));
    expect(attr?.__final_base).toBe(10);
  });

  it("sets __final_temporal = __final_base when no temporal modifiers", () => {
    const [attr, , ] = finalAtributo(directoConBase(10, 10));
    expect(attr?.__final_temporal).toBe(10);
  });

  it("__final_base = __base_calculada + sum(modificadores_base)", () => {
    const [attr, , ] = finalAtributo(directoConBase(10, 10, [mod("Raza", 5), mod("Equipo", 3)]));
    expect(attr?.__final_base).toBe(18);
  });

  it("__final_temporal = __final_base + sum(modificadores_temporales)", () => {
    const [attr, , ] = finalAtributo(directoConBase(10, 10, [mod("Raza", 5)], [mod("Hechizo", 3)]));
    expect(attr?.__final_base).toBe(15);
    expect(attr?.__final_temporal).toBe(18);
  });

  it("supports negative modifiers in base array", () => {
    const [attr, , ] = finalAtributo(directoConBase(10, 10, [mod("Herida", -4)]));
    expect(attr?.__final_base).toBe(6);
  });

  it("supports negative modifiers in temporal array", () => {
    const [attr, , ] = finalAtributo(directoConBase(10, 10, [], [mod("Penalizacion", -3)]));
    expect(attr?.__final_temporal).toBe(7);
  });

  it("__final_base and __final_temporal are independent when temporals are zero-sum", () => {
    const [attr, , ] = finalAtributo(directoConBase(10, 10, [mod("Raza", 5)], [mod("A", 3), mod("B", -3)]));
    expect(attr?.__final_base).toBe(15);
    expect(attr?.__final_temporal).toBe(15);
  });

  it("works with AtributoPD (generic T)", () => {
    const pd = { ...pdAttr(50), __base_calculada: 25 };
    const [attr, , ] = finalAtributo(pd);
    expect(attr?.__final_base).toBe(25);
    expect(attr?.__final_temporal).toBe(25);
  });

  it("works with AtributoCalculado (generic T)", () => {
    const calc = { ...calculado([mod("Motor", 5)]), __base_calculada: 10 };
    const [attr, , ] = finalAtributo(calc);
    expect(attr?.__final_base).toBe(15);
  });

  it("chained after baseAtributoDirecto", () => {
    const [withBase, , err1] = baseAtributoDirecto(directo(10, [mod("Raza", 2)], [mod("Buff", 3)]));
    expect(err1).toBeNull();
    const [attr, , err2] = finalAtributo(withBase);
    expect(err2).toBeNull();
    expect(attr?.__base_calculada).toBe(10);
    expect(attr?.__final_base).toBe(12);
    expect(attr?.__final_temporal).toBe(15);
  });

  it("chained after baseAttributePd", () => {
    const [withBase, , err1] = baseAtributoPD(pdAttr(50, [mod("Categoria", 5)]), 2);
    expect(err1).toBeNull();
    const [attr, , err2] = finalAtributo(withBase);
    expect(err2).toBeNull();
    expect(attr?.__base_calculada).toBe(25);
    expect(attr?.__final_base).toBe(30);
  });

  it("chained after baseAttributeComputed", () => {
    const [withBase, , err1] = baseAtributoCalculado(calculado([], [mod("Hechizo", 4)]), () => 12);
    expect(err1).toBeNull();
    const [attr, , err2] = finalAtributo(withBase);
    expect(err2).toBeNull();
    expect(attr?.__final_base).toBe(12);
    expect(attr?.__final_temporal).toBe(16);
  });

  it("constaint applied with no warns or errors", () => {
    let [attr, warn, err] = baseAtributoDirecto(directo(10, [mod("A", 4)], [mod("A", 4)]));
    [attr, warn, err] = finalAtributo(attr, constraintBase, constraintBase);
    expect(attr!.__final_base).toEqual(14);
    expect(attr!.__final_temporal).toEqual(18);
  });

  it("constaint applied with warns on temp", () => {
    let [attr, warn, err] = baseAtributoDirecto(directo(10, [mod("A", 4)], [mod("A", 10)]));
    [attr, warn, err] = finalAtributo(attr, constraintBase, constraintBase);
    expect(attr!.__final_base).toEqual(14);
    expect(attr!.__final_temporal).toEqual(20);
    expect(warn!.length).toEqual(1);
    expect(warn![0]!.code).toEqual(EngineWarningCode.CONSTRAINT_NOT_MATCHED);
  });

  it("constaint applied with warns on base and temp", () => {
    let [attr, warn, err] = baseAtributoDirecto(directo(10, [mod("A", 15)], [mod("A", 10)]));
    [attr, warn, err] = finalAtributo(attr, constraintBase, constraintBase);
    expect(attr!.__final_base).toEqual(20);
    expect(attr!.__final_temporal).toEqual(20);
    expect(warn!.length).toEqual(2);
    expect(warn![0]!.code).toEqual(EngineWarningCode.CONSTRAINT_NOT_MATCHED);
    expect(warn![1]!.code).toEqual(EngineWarningCode.CONSTRAINT_NOT_MATCHED);
  });

  it("constaint applied with error on temp", () => {
    let [attr, ,] = baseAtributoDirecto(directo(10, [mod("A", 4)], [mod("A", 50)]));
    assertError(finalAtributo(attr, constraintBase, constraintBase), EngineErrorCode.CONSTRAINT_NOT_MATCHED);
  });

  it("constaint applied with error on base", () => {
    let [attr, ,] = baseAtributoDirecto(directo(10, [mod("A", 50)], [mod("A", 5)]));
    assertError(finalAtributo(attr, constraintBase, constraintBase), EngineErrorCode.CONSTRAINT_NOT_MATCHED);
  });
});


// ===========================================================================
// addModifier
// ===========================================================================

describe("addModifier", () => {
  it("returns UNDEFINED_ATTRIBUTE for null attr",      () => assertError(addModifier(null, BaseOrTemporal.BASE, modInput("X", 1)), EngineErrorCode.UNDEFINED_ATTRIBUTE));
  it("returns UNDEFINED_ATTRIBUTE for undefined attr", () => assertError(addModifier(undefined, BaseOrTemporal.BASE, modInput("X", 1)), EngineErrorCode.UNDEFINED_ATTRIBUTE));

  it("appends manual modifier to modificadores_base", () => {
    const [attr, , ] = addModifier(directo(10), BaseOrTemporal.BASE, modInput("Raza", 5));
    expect(attr?.modificadores_base).toHaveLength(1);
    expect((attr?.modificadores_base as ModificadorAtributo[])[0].fuente).toBe("Raza");
    expect((attr?.modificadores_base as ModificadorAtributo[])[0].valor).toBe(5);
  });

  it("appends manual modifier to modificadores_temporales", () => {
    const [attr, , ] = addModifier(directo(10), BaseOrTemporal.TEMPORAL, modInput("Hechizo", 3));
    expect(attr?.modificadores_temporales).toHaveLength(1);
    expect((attr?.modificadores_temporales as ModificadorAtributo[])[0].fuente).toBe("Hechizo");
  });

  it("hydrates modifier with _key on insertion", () => {
    const input = modInput("Raza", 5, "bono racial");
    const [attr, , ] = addModifier(directo(10), BaseOrTemporal.BASE, input);
    const inserted = (attr?.modificadores_base as ModificadorAtributo[])[0];
    expect(inserted._key).toBe(modifierKey(input));
  });

  it("preserves existing modifiers in the target array", () => {
    const existing = mod("Equipo", 2);
    const [attr, , ] = addModifier(directo(10, [existing]), BaseOrTemporal.BASE, modInput("Raza", 5));
    expect(attr?.modificadores_base).toHaveLength(2);
    expect((attr?.modificadores_base as ModificadorAtributo[])[0]).toEqual(existing);
  });

  it("does not touch the other array when adding to base", () => {
    const tempMods = [mod("Buff", 3)];
    const [attr, , ] = addModifier(directo(10, [], tempMods), BaseOrTemporal.BASE, modInput("Raza", 5));
    expect(attr?.modificadores_temporales).toEqual(tempMods);
  });

  it("does not touch the other array when adding to temporal", () => {
    const baseMods = [mod("Raza", 5)];
    const [attr, , ] = addModifier(directo(10, baseMods), BaseOrTemporal.TEMPORAL, modInput("Buff", 3));
    expect(attr?.modificadores_base).toEqual(baseMods);
  });

  it("does not mutate the original attribute", () => {
    const original = directo(10);
    addModifier(original, BaseOrTemporal.BASE, modInput("Raza", 5));
    expect(original.modificadores_base).toHaveLength(0);
  });

  it("returns DUPLICATE_MODIFIER_KEY for manual modifier collision", () => {
    const first = modInput("Raza", 5, "bono racial");
    const [attr, , ] = addModifier(directo(10), BaseOrTemporal.BASE, first);
    const result = addModifier(attr!, BaseOrTemporal.BASE, modInput("Raza", 5, "bono racial"));
    assertError(result, EngineErrorCode.DUPLICATE_MODIFIER_KEY);
  });

  it("auto modifier with collision gets suffixed description", () => {
    const first = modInput("Raza", 5, "bono", true);
    const [attr1] = addModifier(directo(10), BaseOrTemporal.BASE, first);
    const [attr2] = addModifier(attr1!, BaseOrTemporal.BASE, modInput("Raza", 5, "bono", true));
    const mods = attr2?.modificadores_base as ModificadorAtributo[];
    expect(mods).toHaveLength(2);
    expect(mods[1].descripcion).toBe("bono (2)");
  });

  it("auto modifier with multiple collisions increments suffix", () => {
    const input = modInput("Raza", 5, "bono", true);
    const [a1] = addModifier(directo(10), BaseOrTemporal.BASE, input);
    const [a2] = addModifier(a1!, BaseOrTemporal.BASE, input);
    const [a3] = addModifier(a2!, BaseOrTemporal.BASE, input);
    const mods = a3?.modificadores_base as ModificadorAtributo[];
    expect(mods).toHaveLength(3);
    expect(mods[2].descripcion).toBe("bono (3)");
  });

  it("auto modifier with no descripcion gets suffix only", () => {
    const input = modInput("Raza", 5, undefined, true);
    const [a1] = addModifier(directo(10), BaseOrTemporal.BASE, input);
    const [a2] = addModifier(a1!, BaseOrTemporal.BASE, input);
    const mods = a2?.modificadores_base as ModificadorAtributo[];
    expect(mods[1].descripcion).toBe("(2)");
  });

  it("works on AtributoPD", () => {
    const [attr, , ] = addModifier(pdAttr(50), BaseOrTemporal.BASE, modInput("Categoria", 5));
    expect(attr?.modificadores_base).toHaveLength(1);
  });

  it("works on AtributoCalculado", () => {
    const [attr, , ] = addModifier(calculado(), BaseOrTemporal.TEMPORAL, modInput("Motor", 10));
    expect(attr?.modificadores_temporales).toHaveLength(1);
  });
});


// ===========================================================================
// removeModifier
// ===========================================================================

describe("removeModifier", () => {
  it("returns UNDEFINED_ATTRIBUTE for null attr",      () => assertError(removeModifier(null, "somekey"), EngineErrorCode.UNDEFINED_ATTRIBUTE));
  it("returns UNDEFINED_ATTRIBUTE for undefined attr", () => assertError(removeModifier(undefined, "somekey"), EngineErrorCode.UNDEFINED_ATTRIBUTE));

  it("removes modifier matching key from modificadores_base", () => {
    const m = mod("Raza", 5);
    const [attr, , ] = removeModifier(directo(10, [m]), m._key);
    expect(attr?.modificadores_base).toHaveLength(0);
  });

  it("removes modifier matching key from modificadores_temporales", () => {
    const m = mod("Hechizo", 3);
    const [attr, , ] = removeModifier(directo(10, [], [m]), m._key);
    expect(attr?.modificadores_temporales).toHaveLength(0);
  });

  it("removes from both arrays simultaneously when key appears in both", () => {
    const m = mod("Raza", 5);
    const [attr, , ] = removeModifier(directo(10, [m], [m]), m._key);
    expect(attr?.modificadores_base).toHaveLength(0);
    expect(attr?.modificadores_temporales).toHaveLength(0);
  });

  it("preserves other modifiers in the same array", () => {
    const m1 = mod("Raza", 5);
    const m2 = mod("Equipo", 3);
    const [attr, , ] = removeModifier(directo(10, [m1, m2]), m1._key);
    expect(attr?.modificadores_base).toHaveLength(1);
    expect((attr?.modificadores_base as ModificadorAtributo[])[0]).toEqual(m2);
  });

  it("is a no-op when key does not exist", () => {
    const m = mod("Raza", 5);
    const original = directo(10, [m]);
    const [attr, , ] = removeModifier(original, "nonexistent_key");
    expect(attr?.modificadores_base).toHaveLength(1);
  });

  it("is a no-op on empty arrays", () => {
    const [attr, , ] = removeModifier(directo(10), "somekey");
    expect(attr?.modificadores_base).toHaveLength(0);
    expect(attr?.modificadores_temporales).toHaveLength(0);
  });

  it("does not mutate the original attribute", () => {
    const m = mod("Raza", 5);
    const original = directo(10, [m]);
    removeModifier(original, m._key);
    expect(original.modificadores_base).toHaveLength(1);
  });

  it("works on AtributoPD", () => {
    const m = mod("Categoria", 5);
    const [attr, , ] = removeModifier(pdAttr(50, [m]), m._key);
    expect(attr?.modificadores_base).toHaveLength(0);
  });

  it("works on AtributoCalculado", () => {
    const m = mod("Motor", 10);
    const [attr, , ] = removeModifier(calculado([], [m]), m._key);
    expect(attr?.modificadores_temporales).toHaveLength(0);
  });

  it("roundtrip: addModifier then removeModifier restores original state", () => {
    const original = directo(10, [mod("Raza", 5)]);
    const input    = modInput("Extra", 3);
    const [withMod] = addModifier(original, BaseOrTemporal.BASE, input);
    const inserted  = (withMod?.modificadores_base as ModificadorAtributo[]).find(m => m.fuente === "Extra")!;
    const [restored] = removeModifier(withMod!, inserted._key);
    expect(restored?.modificadores_base).toHaveLength(1);
    expect((restored?.modificadores_base as ModificadorAtributo[])[0].fuente).toBe("Raza");
  });
});
