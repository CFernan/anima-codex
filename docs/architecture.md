# Architecture Document: Anima Codex — Character Sheet App
**Version:** 1.4<br >
**Status:** Active<br >
**Related to:** Requirements v3.1

[[toc]]

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
- Read files from disk (character sheet, custom content directories, linked images).
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
- Compute automatic modifiers (race bonuses, category bonuses) from the catalog at computation time and write them into the character state as `__automatico: true` entries. These are recomputed from scratch on every load and never trusted from the persisted file.
- Validate the structure of a loaded file against the Zod schema before accepting it.
- Compare freshly computed `__` values against those persisted in the loaded file, and surface any discrepancies as per-attribute warnings (see §4.4).
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

Base catalogs (default rules and tables) are bundled with the
application as TypeScript modules — they are not read from disk at runtime. Disk
access for catalogs only occurs when the user loads a custom content directory.

### 4.2 Save Character
```
1. The user presses Ctrl+S (or File > Save). The active tab is identified from the app state.
2. The frontend serializes the full character state to JSON .acx format,
   including all engine-computed __ fields as a snapshot of the current session.
3. The frontend invokes the wrapper's "save_file" command with the JSON and the path.
4. Tauri writes the file to disk.
5. Tauri returns ok or error.
6. The frontend updates the "unsaved changes" indicator.
```

See section 5.2 for the `.acx` file format.

### 4.3 Export Character (with computed values)
```
1. The user triggers File > Export or PDF export.
2. The frontend runs the full engine computation for the active character.
3. The frontend builds the enriched export object: format to be discussed.
4. The enriched object is serialized to JSON and written to disk (or passed to the PDF renderer).
```

### 4.4 Open Character
```
1. The user selects a file (dialog or OS double-click).
2. Tauri reads the file and returns its content to the frontend.
3. The frontend validates the structure of personaje and catalogo_local
   against their respective Zod schemas.
4. If validation fails, a descriptive error is shown. The current session is not altered.
5. If validation passes, a new tab is opened with the loaded character state.
6. The engine recomputes all derived values from scratch, overwriting all __ fields
   in the in-memory character state.
7. The freshly computed __ values are compared against those read from the file.
   Any discrepancy produces a per-attribute warning indicating the attribute name,
   the persisted value, and the newly computed value. Warnings are non-blocking —
   the engine's values always take precedence.
8. catalogo_local is loaded and merged into the effective catalog with highest priority.
```

### 4.5 Load Custom Content (Mod) — TBD
```
1. The application loads custom content from a default directory on startup
   (e.g. <app_data>/custom_catalogs/). The user may override this path via Settings.
2. Tauri reads all JSON files in the directory and returns them to the frontend.
3. The frontend passes each file to the catalog store.
4. Each function validates the file against the corresponding schema.
5. Valid entries are merged into the in-memory catalog by identifier.
6. Invalid files produce a per-file CatalogError; remaining files continue loading.
```

**Pending decisions:**
- The default custom content directory path and OS-specific location are TBD.
- A visual interface for browsing, creating, and editing custom catalog entries
  is desirable to avoid requiring users to edit JSON files manually. This is
  deferred to a future iteration.

---

## 5. Data Model

### 5.1 Schema Module Structure

Schemas live under `src/lib/schema/` and are split into three sub-directories.
The dependency graph is a strict DAG — no cycles.
```
src/lib/schema/

  common/                     ← primitives shared by acx/ and catalog/
    enums.ts                  ← all shared enums (CaracteristicaEnum,
                                  KiCaracteristicaEnum, etc.)
    basic_types.ts            ← basic common schemas (AttributeModifier,
                                  DirectAttribute, PDAttribute, etc)

  acx/                        ← shape of the .acx character file
    character.ts              ← root .acx schema (metadata, personaje,
                                  catalogo_local)
    characteristic.ts         ← primary/secondary characteristics,
                                  capacities, resistances
    creation_points.ts        ← PuntosDeCreacion
    category.ts               ← InversionPDs (per-category PD investment)
    combat_abilities.ts       ← HabilidadesDeCombate, HabilidadesDelKi
    supernatural_abilities.ts ← HabilidadesSobrenaturales
    psychic_abilities.ts      ← HabilidadesPsiquicas
    secondary.ts              ← HabilidadesSecundarias
    equipment.ts              ← Armadura, Arma, Equipo
    ki.ts                     ← Ki, ArbolTecnicas, InvocacionPorKi
    mystic.ts                 ← Misticos, NivelesDeMagia
    psychic.ts                ← Psiquicos
    elan.ts                   ← Elan
    state.ts                  ← Estado
    character_miscellany.ts   ← Other minor schemas for character
    local_catalog.ts          ← Schema for local character catalog

  catalog/                    ← validation contracts for base and
                                  custom catalogs
    (pending)
```

Dependency direction: `acx/` → `common/`. `catalog/` → `common/`.
`acx/` and `catalog/` do not depend on each other.

#### Schema vs. Catalog responsibility

| Layer | Validates | Example |
|---|---|---|
| Schema (`schema/`) | Syntax — correct shape and types | `pd` is a non-negative integer |
| Catalog (`catalog/`) | Semantics — values are known and consistent | `"atleticas"` is a valid secondary skill group |

This separation means a `.acx` file with `categoria: "CustomHomebrew"` passes
schema validation — it is a valid string. The catalog is responsible for
rejecting unknown category identifiers at runtime.

#### Zod type conventions

| Usage | Type to use | Reason |
|---|---|---|
| Runtime objects in memory | `z.infer<typeof Schema>` | Post-parse type — what the engine and UI work with. |
| Data file objects pre-parse | `z.input<typeof Schema>` | Pre-parse type — reflects what a raw `.acx` or catalog file may contain before Zod processes it. |
| Default catalog files (`src/lib/catalogs/`) | `satisfies z.input<typeof Schema>` | Compile-time check that the catalog object is a valid input to the schema, without widening the inferred type. Catches missing or mistyped fields at the editor level. |
| Schema exhaustiveness | `satisfies Record<KeyEnum, z.ZodTypeAny>` | Compile-time check that all enum keys are covered in a `schemaFromEnum` call or similar construction. Fails to compile if a new enum value is added without a corresponding schema entry. |

#### Naming conventions

| Pattern | Meaning |
|---|---|
| `*Enum` | A `z.enum()` or `z.union([z.literal(...), ...])` definition |
| `*Schema` | A `z.object()` or composed schema |
| `*Catalog` | A type representing the in-memory catalog used by the engine |

The meaning of `*Schema` depends on its location:
- In `schema/acx/` — describes the shape of data persisted in the `.acx` file
- In `schema/catalog/` — defines the validation contract for catalog entries (base and custom)

**Variable casing:**
- Exported: uppercase first letter — `export const AjustesDeNivelSchema`
- Non-exported: lowercase first letter — `const viaDeMagiaSchema`

### 5.2 The `.acx` File Format

> Normative schema: [`docs/acx_schema.yaml`](../docs/acx_schema.yaml)

See examples of `.acx` files in:
 * [`examples/example1.acx`](../examples/example1.acx)
 * [`examples/example2.acx`](../examples/example2.acx)

The `.acx` file is structured as three top-level sections:

- `metadata` — engine-managed fields: `__version_schema`, `__marca_de_tiempo`, and `jugador`.
- `personaje` — the full character state, containing both user inputs and engine-computed `__` fields.
- `catalogo_local` — character-specific catalog extensions (hot catalog).

**Rules:**
- On **load**, the frontend passes `personaje` to `CharacterSchema.parse()`. `catalogo_local` is handled separately. Unknown keys are stripped silently by Zod to allow backward compatibility.
- On **save** (`File > Save`), all three sections are written, including all current `__` fields as a snapshot of the engine's last computed state.
- On **export** (`File > Export`, PDF), the engine computes all derived values fresh and passes them to the PDF renderer. No additional section is written to the `.acx` file.

### 5.3 What is persisted and who writes it

The `.acx` file is the single source of truth for both user inputs and engine
outputs. The distinction is not persisted/derived but **who writes the field**:

- **User-writable fields** — `base`, `pd`, manual modifier entries, identity fields,
  free-text fields, and all structural choices (race, category, etc.). The engine
  never writes to these fields.
- **Engine-writable fields** — all fields prefixed with `__`: `__base_calculada`,
  `__final_base`, `__final_temporal`, `__automatico`, `__pds_invertidos`,
  `__pds_totales`, `__version_schema`, `__marca_de_tiempo`, etc. The user never
  writes to these fields directly.

The `__` fields serve a dual purpose: they are the engine's output for the current
session, and they are a versioned snapshot used to detect drift on next load (see §4.4).

| Value | Persisted? | Writer |
|---|---|---|
| Characteristic `base` value | ✅ | User |
| `pd` investment per ability | ✅ | User |
| Manual modifiers (`modificadores_base`, `modificadores_temporales`) | ✅ | User |
| Race, category, and other identity fields | ✅ | User |
| `__base_calculada`, `__final_base`, `__final_temporal` | ✅ | Engine |
| Automatic modifiers (`__automatico: true` entries) | ✅ | Engine |
| `__pds_invertidos`, `__pds_totales` | ✅ | Engine |
| `__version_schema`, `__marca_de_tiempo` | ✅ | Engine |

### 5.4 Character Schema (normative)

`CharacterSchema` is defined in `src/lib/schema/acx/character.ts` using Zod.

The schema covers both user-writable and engine-writable fields. Engine-writable
fields (`__` prefix) are optional in the schema to allow loading files where the
engine has not yet run (e.g. a freshly created file). Their absence is not an
error; it simply means no snapshot comparison can be performed on load.

### 5.5 Catalog Schema

Catalog schemas live under `src/lib/schema/catalog/` (pending implementation).
They define the validation contracts for both base and custom content.

#### Catalog layers

The engine constructs the **effective catalog** at runtime by merging three layers.

| Catalog | Priority | Description | Scope |
| :--- | :---: | :--- | :--- |
| **Base** | 1 | Hardcoded modules in `src/lib/catalogs/` | Global |
| **Custom Persistent** | 2 | Loaded from the custom catalog directory. | Intended for homebrew categories, custom magic vias, new secondary skill groups. Loaded at startup alongside the base catalog and persist across all characters. |
| **Custom Hot** | 3 | Embedded in the `.acx` file under `catalogo_local` | Intended for character-specific content: unique weapons, custom ki techniques or new secondary abilities. |

**Collision Logic:** In case of key collisions, the entry from the
**higher-priority layer** wins. For example, a "Custom Hot" entry (Priority 3)
will override a "Custom Persistent" (Priority 2) or "Base" (Priority 1) entry
with the same ID.

The format for hot catalogs is deferred to a future iteration.

> Note: hot catalog entries can be promoted to persistent catalog when needed.
> For example, recurrent custom secondary abilities shared across characters.

#### Base catalog bundling

Base catalogs are TypeScript modules in `src/lib/catalogs/`, validated at compile
time via `satisfies z.input<typeof CatalogSchema>`. No disk read occurs at
startup for base content.

---

## 6. Store Architecture

The frontend state is managed via Svelte stores split by concern.

### 6.1 Catalog Store (`src/lib/stores/catalogs.ts`)

Holds the effective in-memory catalog (base + persistent custom + hot) and a
list of load errors. Initialised at module load time from bundled defaults.
```
_catalogs (writable — private)
  └─ combat:     CombatRuleCatalog
  └─ secondary:  SecondaryRuleCatalog
  └─ categories: AllCategoryRuleDefinition
  └─ errors:     CatalogError[]

Public API (derived stores — read-only):
  combatCatalog       ← consumed by combat skill components and engine
  secondaryCatalog    ← consumed by secondary skill components and engine
  categoriesCatalog   ← consumed by category dropdown, DP cost engine
  catalogErrors       ← consumed by error banner component

Mutation functions (exported):
  loadCustomCombat(raw, identifier?)
  loadCustomSecondary(raw, identifier?)
  loadCustomCategories(raw, identifier?)
  loadHotCatalog(character: Character)   ← loads hot catalog from .acx on open
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
`computeAttributeResults`, `characteristicModifier`) are pure functions called
exclusively from within derived store definitions.

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
| Custom content directory default path | OS-specific location TBD | Before implementing US-24 |