# Architecture Document: Anima Beyond Fantasy — Character Sheet App
**Version:** 1.1
**Status:** Initial draft
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
│  · Schema validation (Zod)             │
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
- Read files from disk (character sheet, content catalogs).
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
- Manage the lifecycle of automatic modifiers: generate them when their source changes (e.g. race or category selection) and remove them when the source is no longer applicable. Manual modifiers are created, edited, and deleted exclusively by the player.
- Validate the structure of a loaded file against the Zod schema before accepting it.
- Keep content catalogs in memory once loaded, for local lookup without additional disk access.
- Request IO operations from the wrapper via commands when necessary.

---

## 4. Main Flows

### 4.1 Application Startup

```
1. Tauri launches the process and opens the window.
2. The frontend requests the wrapper to load the base catalogs.
3. Tauri reads the catalog JSON files and returns them to the frontend.
4. The frontend validates each catalog against its Zod schema.
5. Valid catalogs are kept in memory. Errors are reported.
6. If a file path was passed as a CLI argument, the "Open file" flow is executed.
7. Otherwise, the start screen is presented.
```

### 4.2 Save Character

```
1. The user presses Ctrl+S (or File > Save). The active tab is identified from the app state.
2. The frontend serializes the character state to JSON.
3. The frontend invokes the wrapper's "save_file" command with the JSON and the path.
4. Tauri writes the file to disk.
5. Tauri returns ok or error.
6. The frontend updates the "unsaved changes" indicator.
```

### 4.3 Open Character

```
1. The user selects a file (dialog or OS double-click).
2. Tauri reads the file and returns its content to the frontend.
3. The frontend validates the structure against the Zod schema.
4. If validation fails, a descriptive error is shown. The current session is not altered.
5. If validation passes, the character state is replaced with the loaded data.
```

### 4.4 Load Custom Content (Mod)

```
1. The user specifies a custom content directory.
2. Tauri reads the JSON files in the directory and returns them to the frontend.
3. The frontend validates each file against the corresponding catalog schema.
4. Valid entries override or extend the base catalog in memory, by identifier.
5. Validation errors are reported per file, without interrupting the loading of the rest.
```

---

## 5. Data Model

### 5.1 Character Schema

The character schema will be defined and versioned with Zod. It will include an explicit version field to detect incompatibilities between future schema versions.

All attributes on the character sheet (primary characteristics, primary and secondary abilities, and derived values) follow a **composite attribute model** with three distinct layers. This is the general rule; individual attributes may be explicitly exempted and treated as simple scalars where the added complexity provides no benefit.

```typescript
// Illustrative example — not normative

const AttributeModifierSchema = z.object({
  value:       z.number(),           // positive or negative
  source:      z.string(),           // engine-generated ID or player-defined label
  descriptor:  z.string().optional(),// optional human-readable label
  automatic:   z.boolean(),          // if true, managed by engine — read-only for the user
});

// Reusable composite attribute — applies to primary stats, abilities, and derived values
const AttributeSchema = z.object({
  base:                z.number().int(),
  base_modifiers:      z.array(AttributeModifierSchema), // permanent; count toward requirements
  temporary_modifiers: z.array(AttributeModifierSchema), // transient; excluded from requirements
});

// Effective value:     base + sum(base_modifiers) + sum(temporary_modifiers)
// Requirement value:   base + sum(base_modifiers)

const CharacterSchema = z.object({
  schema_version: z.literal("1.0"),
  identity: z.object({
    name:     z.string(),
    race:     z.string(),
    category: z.string(),
    level:    z.number().int().min(1),
  }),
  primary_stats: z.object({
    agility:      AttributeSchema,
    constitution: AttributeSchema,
    dexterity:    AttributeSchema,
    strength:     AttributeSchema,
    intelligence: AttributeSchema,
    perception:   AttributeSchema,
    power:        AttributeSchema,
    willpower:    AttributeSchema,
  }),
  // ... abilities, DP, derived values, free-text fields
});

// Tab — represents a single open character sheet instance
const TabSchema = z.object({
  id:              z.string(),       // unique tab identifier (e.g. UUID)
  character:       CharacterSchema,
  currentFilePath: z.string().nullable(),
  isDirty:         z.boolean(),
});

const AppStateSchema = z.object({
  tabs:          z.array(TabSchema),
  activeTabId:   z.string().nullable(),
});

type Tab         = z.infer<typeof TabSchema>;
type AppState    = z.infer<typeof AppStateSchema>;
type AttributeModifier = z.infer<typeof AttributeModifierSchema>;
type Attribute         = z.infer<typeof AttributeSchema>;
type Character         = z.infer<typeof CharacterSchema>;
```

### 5.2 Catalog Schema

Each content catalog (weapons, abilities, etc.) will follow its own documented schema. All catalogs will share a unique `id` field that acts as the override key for mods.

```json
{
  "catalog": "weapons",
  "version": "1.0",
  "entries": [
    {
      "id": "short_sword",
      "name": { "es": "Espada corta", "en": "Short Sword" },
      "damage": "40",
      "speed": 10
    }
  ]
}
```

---

## 6. Security Considerations

- The frontend has no direct access to the file system. All IO operations go through Tauri commands explicitly declared in the app configuration.
- Custom content files (mods) are validated against the Zod catalog schema before being incorporated into the application state. A malformed file cannot corrupt the application state.
- In this version, content files are pure data (JSON), not executable code, which eliminates the most relevant attack vector for malicious mods.
- The ability to define executable formulas in external files (currently a `[WON'T]` requirement) will require a dedicated security analysis before implementation.

---

## 7. Pending Decisions

| Decision | Context | Suggested timing |
|---|---|---|
| Formula parsing library | Required when engine formula modification is addressed (current `[WON'T]`) | Before second phase |
| `.xlsx` migration tool | Backlog. Candidate: Python + openpyxl | Before public distribution |
| PDF export template system | `[COULD]` requirement | If addressed, evaluate between CSS print and a dedicated library |
| Application update mechanism | Not covered in current requirements | Before public distribution |