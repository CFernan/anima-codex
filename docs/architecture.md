# Architecture Document: Anima Beyond Fantasy — Character Sheet App
**Version:** 1.2
**Status:** Active
**Related to:** Requirements v2.0

---

## 1. Overview

The application is structured as two distinct processes communicating via an explicit command API. This separation is structural and non-optional: it is enforced by the chosen desktop framework (Tauri) and is consistent with the security requirements defined for loading external content.

```
┌─────────────────────────────────────────┐
│             Frontend Process            │
│          Svelte + TypeScript            │
│                                         │
│  · User interface                       │
│  · Domain logic (Anima rules)           │
│  · Character state in memory            │
│  · Schema validation (Zod)              │
└─────────────┬───────────────────────────┘
              │  Tauri command API
              │  (explicit messages)
┌─────────────▼───────────────────────────┐
│             Wrapper Process             │
│               Tauri + Rust              │
│                                         │
│  · Native window management             │
│  · File read / write                    │
│  · .acx extension registration with OS  │
│  · CLI argument handling                │
└─────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Desktop wrapper | Tauri (Rust) | Minimal bundle (~5 MB), explicit permission-based security model, native webview |
| Frontend | Svelte + TypeScript | Compiler-level declarative reactivity, ideal for cascading derived values |
| Schema validation | Zod | TypeScript types are inferred directly from the schema, no duplication |
| Data format | JSON | Larger tooling ecosystem than YAML; equally readable at this data size |
| Formula parsing | Pending (math.js candidate) | Out of scope for the first phase |

### 2.1 Discarded Alternatives

**Electron** — Discarded in favour of Tauri due to its bundle model (ships a full Chromium, ~150 MB minimum) and its lack of a native permission model for file system access.

**React / Vue** — Vue 3 with Composition API is a viable alternative and would be the second choice. Svelte is preferred for its smaller API surface and because its reactivity model is more natural for a graph of derived values with many dependencies, without the need to manage `useMemo` or equivalents.

**Ajv + JSON Schema** — Discarded in favour of Zod because it requires maintaining the validation schema and TypeScript types separately, introducing a risk of divergence.

---

## 3. Separation of Concerns

### 3.1 Wrapper (Tauri / Rust)

Exclusive responsibilities:
- Create and manage the application window.
- Read files from disk (character sheet, custom content directories).
- Write files to disk (save character sheet, backups).
- Register the `.acx` extension with the operating system.
- Receive the file path as an argument when the application is launched.
- Expose the above capabilities to the frontend via explicitly declared commands.

The wrapper contains no game domain logic.

### 3.2 Frontend (Svelte / TypeScript)

Exclusive responsibilities:
- Render the user interface.
- Maintain an array of open character tabs in memory during the session, each with its own character state, file path, and dirty flag. The active tab determines which character is currently displayed and edited.
- Execute all domain logic: derived value computation, DP validation, category cost application.
- Derive automatic modifiers (race bonuses, category bonuses) from the catalog at computation time. These are never persisted in the character file.
- Validate the structure of a loaded file against the Zod schema before accepting it.
- Keep content catalogs in memory once loaded, for local lookup without additional disk access.
- Request IO operations from the wrapper via commands when necessary.

---

## 4. Main Flows

### 4.1 Application Startup

```
1. Tauri launches the process and opens the window.
2. The catalog store initialises from bundled default data (no disk read required).
3. Default catalogs are validated against their Zod schemas.
4. Validation errors are reported; the application remains functional.
5. If a file path was passed as a CLI argument, the "Open file" flow is executed.
6. Otherwise, the start screen is presented.
```

Base catalogs (combat skills, secondary skills, categories) are bundled with the
application as TypeScript modules — they are not read from disk at runtime. Disk
access for catalogs only occurs when the user loads a custom content directory.

### 4.2 Save Character

```
1. The user presses Ctrl+S (or File > Save). The active tab is identified from the app state.
2. The frontend serializes the character state to JSON (data section only).
3. The frontend invokes the wrapper's "save_file" command with the JSON and the path.
4. Tauri writes the file to disk.
5. Tauri returns ok or error.
6. The frontend updates the "unsaved changes" indicator.
```

### 4.3 Export Character (with computed values)

```
1. The user triggers File > Export or PDF export.
2. The frontend runs the full engine computation for the active character.
3. The frontend builds the enriched export object: { data: Character, computed: ComputedStats }.
4. The enriched object is serialized to JSON and written to disk (or passed to the PDF renderer).
```

See section 5.2 for the `.acx` file format.

### 4.4 Open Character

```
1. The user selects a file (dialog or OS double-click).
2. Tauri reads the file and returns its content to the frontend.
3. The frontend extracts the "data" section from the file.
4. The frontend validates the structure against CharacterSchema.
5. If validation fails, a descriptive error is shown. The current session is not altered.
6. If validation passes, a new tab is opened with the loaded character state.
7. The engine recomputes all derived values from scratch. Any "computed" section
   in the file is ignored on load — calculated values always override persisted ones.
```

### 4.5 Load Custom Content (Mod)

```
1. The user specifies a custom content directory via Settings.
2. Tauri reads all JSON files in the directory and returns them to the frontend.
3. The frontend passes each file to the catalog store (loadCustomCombat,
   loadCustomSecondary, or loadCustomCategories).
4. Each function validates the file against the corresponding schema.
5. Valid entries are merged into the in-memory catalog by identifier.
6. Invalid files produce a per-file CatalogError; remaining files continue loading.
```

---

## 5. Data Model

### 5.1 Schema Module Structure

Schemas are split by domain. The dependency graph is a strict DAG — no cycles.

```
character.ts
     ↑
combat.ts   secondary.ts   category.ts
     ↑            ↑              ↑
     └────────────┴──────────────┘
                attribute.ts
```

Each module owns the enums and types whose meaning is defined within it.
`attribute.ts` owns `CaracteristicaEnum` because characteristics are the
foundation of the attribute hierarchy. `category.ts` owns `ArquetipoEnum`.

#### Zod type conventions

| Usage | Type to use | Reason |
|---|---|---|
| Runtime objects in memory | `z.infer<typeof Schema>` | All defaults applied, types narrowed |
| Data file objects (input) | `z.input<typeof Schema>` | Fields with `.default()` are optional |
| Schema exhaustiveness | `satisfies Record<KeyEnum, z.ZodTypeAny>` | Compile-time check that all enum keys are covered |

#### Naming conventions

| Suffix | Meaning |
|---|---|
| `*Enum` | A `z.enum()` definition |
| `*Schema` | A `z.object()` or composed schema |
| `*InvestmentSchema` | Values the player has invested in (PD-based attributes) |
| `*CostSchema` | PD cost per category for an ability |
| `*DefinitionSchema` | Static catalog rules (name, characteristic, penalties) |

### 5.2 The `.acx` File Format

A `.acx` file is a JSON file with two top-level sections:

```json
{
  "schema_version": "1.0",
  "datos": {
    // The character as defined by CharacterSchema.
    // This is the source of truth. Only user-editable values live here.
    // Automatic modifiers (race bonuses, category bonuses) are NOT persisted —
    // they are derived from the catalog at load time.
    "nombre": "Kael",
    "raza": "Sylvain",
    "caracteristicas_primarias": {
      "agi": {
        "base": 10,
        "modificadores_base": [
          {
            "valor": 1,
            "fuente": "Bendición divina",
            "descriptor": "Bendición permanente recibida por la Beryl Gabriel"
          }
        ],
        "modificadores_temporales": []
      }
    }
  },
  "calculados": {
    // Derived values serialized for human readability and offline export.
    // Generated by the engine at save/export time.
    // IGNORED on load — the engine always recomputes from "data".
    // This section may be absent in files saved by older versions.
    "caracteristicas_primarias": {
      "agi": { "total": 12, "bono": 20 }
    }
  }
}
```

**Rules:**
- On **load**, the frontend reads `file.datos` and passes it to `CharacterSchema.parse()`. The `calculados` section is not read. Unknown keys in `datos` are stripped silently by Zod.
- On **save** (`File > Save`), only `datos` is written. `calculados` is omitted.
- On **export** (`File > Export`, PDF), both `datos` and `calculados` are written. `calculados` is generated fresh by the engine at export time.
- If `calculados` diverges from what the engine would calculate (e.g. the file was edited manually), the engine result always takes precedence on load.

### 5.3 What is persisted vs. what is derived

The central rule: **only values that the user can change are persisted in `datos`.**
Everything that can be recalculated from those values lives in the engine as derived stores.

| Value | Persisted in `datos`? | Reason |
|---|---|---|
| Characteristic base value | ✅ | Set by the user |
| Manual modifiers (base and temporary) | ✅ | Created explicitly by the player |
| Race and category identifiers | ✅ | Chosen by the user |
| Race/category bonuses | ❌ | Derived from catalog at runtime |
| Characteristic total | ❌ | `base + sum(mods)` — computed |
| Characteristic modifier (bono) | ❌ | Table lookup on total — computed |
| DP spent / remaining | ❌ | Sum over all ability investments — computed |
| Resistance values | ❌ | Formula over primary stats — computed |

Persisting derived values in `calculados` is a convenience for human readability
and export, not a data source. The engine never reads from `calculados`.

### 5.4 Character Schema (normative)

`CharacterSchema` is defined in `src/lib/schema/character.ts` using Zod.
The illustrative structure below reflects the actual implementation.

```typescript
// attribute.ts — foundation
const AttributeModifierSchema = z.object({
  valor:      z.number(),
  fuente:     z.string(),
  descriptor: z.string().optional(),
});

const DirectAttributeSchema = z.object({
  modificadores_base:      z.array(AttributeModifierSchema),
  modificadores_temporales: z.array(AttributeModifierSchema),
  base: z.number().int().nonnegative(),
});

const PDAttributeSchema = z.object({
  modificadores_base:      z.array(AttributeModifierSchema),
  modificadores_temporales: z.array(AttributeModifierSchema),
  pd: z.number().int().nonnegative(),
});

// character.ts — root schema
const CharacterSchema = z.object({
  schema_version: z.literal(1),
  nombre:         z.string(),
  raza:           z.string(),
  categorias:     z.array(CharacterCategorySchema).min(1),
  primary_stats: z.object({
    agi: DirectAttributeSchema,
    con: DirectAttributeSchema,
    des: DirectAttributeSchema,
    fue: DirectAttributeSchema,
    int: DirectAttributeSchema,
    per: DirectAttributeSchema,
    pod: DirectAttributeSchema,
    vol: DirectAttributeSchema,
  }),
  // resistances, combat skills, secondary skills, presence, etc.
});
```

Note: `AttributeModifierSchema` does **not** include an `automatico` flag.
Automatic modifiers (race and category bonuses) are not persisted — they are
computed from the catalog every time the engine runs.

### 5.5 Catalog Schema

Each catalog is validated by its own schema on load. Custom content files are
validated against the same schema before being merged into the in-memory catalog.

Catalog entries are identified by key (the field name in the object) rather than
by a separate `id` field, which eliminates a class of key/id mismatch bugs.

Override behaviour differs by catalog type:

| Catalog | Override strategy |
|---|---|
| Combat skills | Only the `custom` record is extendable. Official slots are immutable. |
| Secondary skills | Per-group `custom` record is extendable. Official skill slots are immutable. Root-level `custom` groups can be added. |
| Categories | Full override by key — a custom entry with an existing category name replaces it entirely. Enables house rules. |

---

## 6. Store Architecture

The frontend state is managed via Svelte stores split by concern.

### 6.1 Catalog Store (`src/lib/stores/catalogs.ts`)

Holds the three in-memory catalogs and a list of load errors.
Initialised once at module load time from bundled defaults.

```
_catalogs (writable — private)
  └─ combat:     CombatCatalog
  └─ secondary:  SecondaryCatalog
  └─ categories: AllCategoryDefinition
  └─ errors:     CatalogError[]

Public API (derived stores — read-only):
  combatCatalog       ← consumed by combat skill components
  secondaryCatalog    ← consumed by secondary skill components
  categoriesCatalog   ← consumed by category dropdown, DP cost engine
  catalogErrors       ← consumed by error banner component

Mutation functions (exported):
  loadCustomCombat(raw, identifier?)
  loadCustomSecondary(raw, identifier?)
  loadCustomCategories(raw, identifier?)
  resetToDefaults()
```

No component accesses `_catalogs` directly. All reads go through derived stores;
all writes go through the mutation functions, which validate with Zod before
modifying state.

### 6.2 App Store (`src/lib/stores/app.ts`) — pending US-18

Will hold the full session state: open tabs, active tab, per-tab character state
and dirty flags.

```
_appState (writable — private)
  └─ tabs: Tab[]
      └─ id, character, currentFilePath, isDirty
  └─ activeTabId: string | null

Public API (derived stores — read-only):
  activeTab      ← current tab object
  derivedStats   ← computeDerivedStats(activeTab.character, catalogs)
  dpSummary      ← totalDpSpent / remainingDp for active character

Mutation functions (exported):
  openNewTab, closeTab, focusTab
  setBase, addManualModifier, removeModifier
  setIdentityField
```

The key invariant: **no component computes derived values locally.** All
components read from derived stores. The engine functions (`computeDerivedStats`,
`effectiveValue`, `characteristicModifier`) are pure functions called exclusively
from within derived store definitions.

---

## 7. Security Considerations

- The frontend has no direct access to the file system. All IO operations go through Tauri commands explicitly declared in the app configuration.
- Custom content files (mods) are validated against the Zod catalog schema before being incorporated into the application state. A malformed file cannot corrupt the application state.
- In this version, content files are pure data (JSON), not executable code, which eliminates the most relevant attack vector for malicious mods.
- The ability to define executable formulas in external files (currently a `[WON'T]` requirement) will require a dedicated security analysis before implementation.

---

## 8. Pending Decisions

| Decision | Context | Suggested timing |
|---|---|---|
| Formula parsing library | Required when engine formula modification is addressed (current `[WON'T]`) | Before second phase |
| `.xlsx` migration tool | Backlog. Candidate: Python + openpyxl | Before public distribution |
| PDF export template system | `[COULD]` requirement | If addressed, evaluate between CSS print and a dedicated library |
| Application update mechanism | Not covered in current requirements | Before public distribution |
| `computed` section schema | Currently untyped. A `ComputedStatsSchema` could validate it for export integrity | Before implementing export (US-26) |