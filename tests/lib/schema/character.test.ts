import { describe, it, expect } from "vitest";
import { CharacterSchema } from "../../../src/lib/schema/character";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const validModifier = {
  valor: 5,
  fuente: "Raza",
  automatico: true,
};

const validDirectAttribute = {
  base: 10,
  modificadores_base: [],
  modificadores_temporales: [],
};

const validDirectCharacteristicSkill = (caracteristica: string) => ({
  base: 0,
  caracteristica,
  modificadores_base: [],
  modificadores_temporales: [],
});

const validPDSkill = (caracteristica: string) => ({
  pd: 0,
  caracteristica,
  modificadores_base: [],
  modificadores_temporales: [],
});

const validHybridAttribute = {
  base: 40,
  pd: 0,
  modificadores_base: [],
  modificadores_temporales: [],
};

const validCombat = {
  habilidad_ataque:  validPDSkill("des"),
  habilidad_parada:  validPDSkill("des"),
  habilidad_esquiva: validPDSkill("agi"),
  llevar_armadura:   validPDSkill("fue"),
};

const validSecundarias = {
  atleticas: {
    acrobacias: validPDSkill("agi"),
    atletismo:  validPDSkill("agi"),
    montar:     validPDSkill("agi"),
    nadar:      validPDSkill("agi"),
    trepar:     validPDSkill("agi"),
    saltar:     validPDSkill("fue"),
    pilotar:    validPDSkill("des"),
  },
  sociales: {
    estilo:     validPDSkill("pod"),
    intimidar:  validPDSkill("vol"),
    liderazgo:  validPDSkill("pod"),
    persuasion: validPDSkill("int"),
    comercio:   validPDSkill("int"),
    callejeo:   validPDSkill("int"),
    etiqueta:   validPDSkill("int"),
  },
  perceptivas: {
    advertir: validPDSkill("per"),
    buscar:   validPDSkill("per"),
    rastrear: validPDSkill("per"),
  },
  intelectuales: {
    animales:   validPDSkill("int"),
    ciencia:    validPDSkill("int"),
    ley:        validPDSkill("int"),
    herbolaria: validPDSkill("int"),
    historia:   validPDSkill("int"),
    tactica:    validPDSkill("int"),
    medicina:   validPDSkill("int"),
    memorizar:  validPDSkill("int"),
    navegacion: validPDSkill("int"),
    ocultismo:  validPDSkill("int"),
    tasacion:   validPDSkill("int"),
    v_magica:   validPDSkill("pod"),
  },
  vigor: {
    frialdad:  validPDSkill("vol"),
    p_fuerza:  validPDSkill("fue"),
    res_dolor: validPDSkill("vol"),
  },
  subterfugio: {
    cerrajeria: validPDSkill("des"),
    disfraz:    validPDSkill("des"),
    ocultarse:  validPDSkill("per"),
    robo:       validPDSkill("des"),
    sigilo:     validPDSkill("agi"),
    tramperia:  validPDSkill("des"),
    venenos:    validPDSkill("int"),
  },
  creativas: {
    arte:              validPDSkill("pod"),
    baile:             validPDSkill("agi"),
    forja:             validPDSkill("des"),
    runas:             validPDSkill("des"),
    alquimia:          validPDSkill("int"),
    animismo:          validPDSkill("pod"),
    musica:            validPDSkill("pod"),
    t_manos:           validPDSkill("des"),
    caligrafia_ritual: validPDSkill("des"),
    orfebreria:        validPDSkill("des"),
    confeccion:        validPDSkill("des"),
    conf_marionetas:   validPDSkill("pod"),
  },
};

const validCategory = {
  nombre: "Guerrero",
  nivel: 1,
  combate: validCombat,
  secundarias: validSecundarias,
  puntos_de_vida: validHybridAttribute,
};

const validCharacter = {
  schema_version: 1 as const,
  nombre:  "Kael",
  jugador: "Carlos",
  raza:    "Humano",
  categorias: [validCategory],
  agi: validDirectAttribute,
  con: validDirectAttribute,
  des: validDirectAttribute,
  fue: validDirectAttribute,
  int: validDirectAttribute,
  per: validDirectAttribute,
  pod: validDirectAttribute,
  vol: validDirectAttribute,
  apariencia: validDirectAttribute,
  tamaño:     validDirectAttribute,
  turno:      validDirectAttribute,
  presencia:  validDirectAttribute,
  rf: validDirectCharacteristicSkill("con"),
  re: validDirectCharacteristicSkill("con"),
  rv: validDirectCharacteristicSkill("con"),
  rm: validDirectCharacteristicSkill("pod"),
  rp: validDirectCharacteristicSkill("vol"),
  puntos_creacion: { total: 3, gastados: 0 },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CharacterSchema", () => {
  it("accepts a valid character", () => {
    const result = CharacterSchema.safeParse(validCharacter);
    expect(result.success).toBe(true);
  });

  it("strips unknown fields", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      campo_desconocido: "valor",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).campo_desconocido).toBeUndefined();
    }
  });

  it("fails when schema_version is missing", () => {
    const { schema_version, ...rest } = validCharacter;
    const result = CharacterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when schema_version is wrong", () => {
    const result = CharacterSchema.safeParse({ ...validCharacter, schema_version: 2 });
    expect(result.success).toBe(false);
  });

  it("fails when nombre is missing", () => {
    const { nombre, ...rest } = validCharacter;
    const result = CharacterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("fails when nombre is not a string", () => {
    const result = CharacterSchema.safeParse({ ...validCharacter, nombre: 42 });
    expect(result.success).toBe(false);
  });

  it("fails when categorias is empty", () => {
    const result = CharacterSchema.safeParse({ ...validCharacter, categorias: [] });
    expect(result.success).toBe(false);
  });

  it("fails when categoria nivel is zero", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      categorias: [{ ...validCategory, nivel: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("fails when a primary characteristic base is negative", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      agi: { ...validDirectAttribute, base: -1 },
    });
    expect(result.success).toBe(false);
  });

  it("fails when a primary characteristic base is not an integer", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      agi: { ...validDirectAttribute, base: 5.5 },
    });
    expect(result.success).toBe(false);
  });

  it("fails when pd is negative", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      categorias: [{
        ...validCategory,
        combate: {
          ...validCombat,
          habilidad_ataque: { ...validPDSkill("des"), pd: -10 },
        },
      }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional trasfondo and notas", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      trasfondo: "Un guerrero del norte.",
      notas: "Pendiente de revisar equipo.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts custom secondary skills", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      categorias: [{
        ...validCategory,
        secundarias: {
          ...validSecundarias,
          creativas: {
            ...validSecundarias.creativas,
            custom: {
              cocina: validPDSkill("pod"),
            },
          },
        },
      }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a modifier with optional descriptor", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      agi: {
        ...validDirectAttribute,
        modificadores_base: [{ ...validModifier, descriptor: "Bonificador racial" }],
      },
    });
    expect(result.success).toBe(true);
  });

  it("fails when a modifier is missing automatico", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      agi: {
        ...validDirectAttribute,
        modificadores_base: [{ valor: 5, fuente: "Raza" }],
      },
    });
    expect(result.success).toBe(false);
  });

  it("accepts multi-class character", () => {
    const result = CharacterSchema.safeParse({
      ...validCharacter,
      categorias: [
        validCategory,
        { ...validCategory, nombre: "Acróbata", nivel: 1 },
      ],
    });
    expect(result.success).toBe(true);
  });
});
