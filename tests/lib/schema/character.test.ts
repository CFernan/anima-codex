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

const validPDAttribute = {
  pd: 0,
  modificadores_base: [],
  modificadores_temporales: [],
};

const validHybridAttribute = {
  base: 40,
  pd: 0,
  modificadores_base: [],
  modificadores_temporales: [],
};

const validCombat = {
  habilidad_ataque:  validPDAttribute,
  habilidad_parada:  validPDAttribute,
  habilidad_esquiva: validPDAttribute,
  llevar_armadura:   validPDAttribute,
};

const validSecundarias = {
  atleticas: {
    acrobacias: validPDAttribute,
    atletismo:  validPDAttribute,
    montar:     validPDAttribute,
    nadar:      validPDAttribute,
    trepar:     validPDAttribute,
    saltar:     validPDAttribute,
    pilotar:    validPDAttribute,
  },
  sociales: {
    estilo:     validPDAttribute,
    intimidar:  validPDAttribute,
    liderazgo:  validPDAttribute,
    persuasion: validPDAttribute,
    comercio:   validPDAttribute,
    callejeo:   validPDAttribute,
    etiqueta:   validPDAttribute,
  },
  perceptivas: {
    advertir: validPDAttribute,
    buscar:   validPDAttribute,
    rastrear: validPDAttribute,
  },
  intelectuales: {
    animales:   validPDAttribute,
    ciencia:    validPDAttribute,
    ley:        validPDAttribute,
    herbolaria: validPDAttribute,
    historia:   validPDAttribute,
    tactica:    validPDAttribute,
    medicina:   validPDAttribute,
    memorizar:  validPDAttribute,
    navegacion: validPDAttribute,
    ocultismo:  validPDAttribute,
    tasacion:   validPDAttribute,
    v_magica:   validPDAttribute,
  },
  vigor: {
    frialdad:  validPDAttribute,
    p_fuerza:  validPDAttribute,
    res_dolor: validPDAttribute,
  },
  subterfugio: {
    cerrajeria: validPDAttribute,
    disfraz:    validPDAttribute,
    ocultarse:  validPDAttribute,
    robo:       validPDAttribute,
    sigilo:     validPDAttribute,
    tramperia:  validPDAttribute,
    venenos:    validPDAttribute,
  },
  creativas: {
    arte:              validPDAttribute,
    baile:             validPDAttribute,
    forja:             validPDAttribute,
    runas:             validPDAttribute,
    alquimia:          validPDAttribute,
    animismo:          validPDAttribute,
    musica:            validPDAttribute,
    t_manos:           validPDAttribute,
    caligrafia_ritual: validPDAttribute,
    orfebreria:        validPDAttribute,
    confeccion:        validPDAttribute,
    conf_marionetas:   validPDAttribute,
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
  rf: validDirectAttribute,
  re: validDirectAttribute,
  rv: validDirectAttribute,
  rm: validDirectAttribute,
  rp: validDirectAttribute,
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
          habilidad_ataque: { ...validPDAttribute, pd: -10 },
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
            custom: { cocina: validPDAttribute },
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
