# Requirements Specification: Anima Codex — Character Sheet App
**Version:** 3.1
**Status:** Active

---

## Conventions

| Label | Meaning |
|---|---|
| **[MUST]** | Mandatory. The application is not valid without this requirement. |
| **[SHOULD]** | Strongly recommended. Its absence represents a notable degradation. |
| **[COULD]** | Desirable if effort allows. Does not block the release. |
| **[WON'T]** | Out of current scope. Documented to prevent scope creep. |

---

## 1. Project Overview

The goal is to replace a proprietary macro-based `.xlsx` character sheet with a lightweight, open-source, and extensible desktop application for the *Anima: Beyond Fantasy* tabletop RPG.

The application will be designed with a **clearly separated two-layer architecture**: a decoupled rules engine and a reactive user interface. This separation allows game subsystems (Combat, Magic, Ki, Psychic) to be incorporated incrementally in future iterations without rewriting the foundation.

### 1.1 First Release Scope

The `.acx` schema covers all game subsystems (combat, magic, ki, psychic) from
the start. This is intentional — defining the full data shape upfront avoids
costly migrations later. However, **full subsystem support requires three layers**:
schema, catalogs, and engine. The first release implements all three layers only
for the core subsystems.

| Subsystem | Schema | Catalogs | Engine | First release |
|---|---|---|---|---|
| Primary characteristics | ✅ | ✅ | ✅ | ✅ |
| Secondary abilities | ✅ | ✅ | ✅ | ✅ |
| Basic combat | ✅ | ✅ | ✅ | ✅ |
| Ki | ✅ | ⏳ | ⏳ | ❌ |
| Magic | ✅ | ⏳ | ⏳ | ❌ |
| Psychic | ✅ | ⏳ | ⏳ | ❌ |

**Included in first release:**
- Complete `.acx` schema covering all subsystems.
- Character identity, primary characteristics, derived secondary values, and free-text fields.
- Reactive computation engine for core subsystems (characteristics, secondary abilities, combat).
- Character file management (create, open, save).
- PDF export / print view.
- Base catalogs for core subsystems.

**Explicitly excluded (future backlog — catalogs and engine only):**
- Combat subsystem: turns, maneuvers, damage tables.
- Magic subsystem: Zeon, casting, spell management, mystic catalogs.
- Ki subsystem: ki techniques, accumulation, martial arts catalogs.
- Psychic subsystem: CV management, psychic power catalogs.
- Migration tool from legacy `.xlsx` format.
- Campaign or session management (multiple characters, game notes).
- Multiplayer or cloud synchronization.

---

## 2. Architecture & Environment

- **[MUST]** The application shall be a standalone desktop executable, compatible with Windows, Linux, and macOS.
- **[MUST]** The application shall register a custom file extension with the operating system (e.g. `.acx` or `.anima`) to associate character files with the app.
- **[MUST]** The application shall be launchable by passing a file path as an argument (double-click in the file explorer).
- **[SHOULD]** The architecture shall explicitly separate the **rules engine** (computation logic and game data) from the **presentation layer** (user interface), so that both can evolve independently.

---

## 3. Data Management & Portability

### 3.1 Storage Format

- **[MUST]** All character data shall be stored in JSON format, readable by both humans and machines.
- **[MUST]** The use of binary or proprietary formats for primary storage is prohibited.
- **[MUST]** JSON files shall always be pretty-printed (2-space indentation) to maximise human readability.
- **[MUST]** The character data schema shall be formally defined and versioned via `metadata.__version_schema`, so that the application can detect and reject files with an incompatible format. This field is managed exclusively by the engine and is never modified directly by the user.
- **[SHOULD]** When loading a file, the application shall validate its structure against the defined schema and display a descriptive error if the file is malformed, instead of producing a silent failure or crash.
- **[COULD]** In a future iteration, the `.acx` file format shall be migrated from JSON to YAML, to improve human readability. The backend shall handle the YAML↔JSON conversion transparently, with no impact on the frontend or the schema definition.

### 3.2 Migration from Legacy Format (Out of Scope — First Phase)

- **[COULD]** A standalone conversion utility shall be provided, capable of reading an existing `.xlsx` character sheet and producing a file in the new format.
- **[COULD]** The conversion utility shall explicitly report which fields could not be mapped automatically, so the user can complete them manually.
- **[COULD]** The conversion utility shall be integrated into the application itself as an import option, without requiring a separate execution.

---

## 4. Functional Requirements

### 4.1 Document-Based Workflow

- **[MUST]** `File > New`: Creates a blank character sheet with default values.
- **[MUST]** `File > Open`: Allows the user to select and load an existing character file.
- **[MUST]** `File > Save`: Persists the current state to the open file.
- **[MUST]** `File > Save As`: Persists the current state to a new user-chosen path.
- **[MUST]** If the user attempts to close the application or open another file with unsaved changes, a confirmation dialog shall be presented with the options: Save, Discard, and Cancel.
- **[SHOULD]** The application shall maintain a list of recently opened files, accessible from the menu.
- **[COULD]** The application shall offer a configurable auto-save option.
- **[WON'T]** The application shall not provide a side-by-side character comparison view in this version. This capability is deferred to a future iteration.

### 4.2 Character Sheet Content (First Scope)

- **[MUST]** The sheet shall capture character identity data: name, race, being type, gnosis, and descriptive fields (age, sex, height, weight, region, social class, background, images).
- **[MUST]** The sheet shall include the eight Primary Characteristics of Anima (Agility, Constitution, Dexterity, Strength, Intelligence, Perception, Power, Willpower).
- **[MUST]** The sheet shall automatically calculate and display secondary values derived from the Primary Characteristics (Characteristic Modifier, Movement, Initiative, etc.), respecting Anima's specific rounding rules.
- **[MUST]** The sheet shall support multiclass characters — a character may belong to one or more categories simultaneously, each with its own PD investment.
- **[MUST]** The sheet shall include the selection of one or more categories from all available options.
- **[MUST]** The sheet shall include a section for Secondary Abilities and Primary Combat Abilities, accounting for Development Points (DP) and the costs per category.
- **[MUST]** The sheet shall include free-text fields for background and notes. These fields support rich text content (e.g. HTML), allowing the user to format text with paragraphs, bold, italic, and lists. Multiple image files may be attached via relative path references.
- **[WON'T]** This version shall not include engine support for Magic, Ki, or Psychic subsystems. The schema accommodates these fields, but computed values and catalog validation for these subsystems are deferred.

### 4.3 Reactive Computation Engine

- **[MUST]** Any change to a Primary Characteristic or a Primary or Secondary Ability shall trigger the immediate and visible recalculation of all dependent values, without requiring any additional action from the user.
- **[MUST]** The engine shall support lookups against predefined value tables (e.g. Resistance tables based on Presence).
- **[MUST]** Computation formulas are implemented as pure TypeScript functions within the engine module. They are not embedded in UI components and have no dependencies on the presentation layer.
- **[MUST]** Every attribute on the character sheet (primary characteristics, primary and secondary abilities, and derived values such as Initiative or Regeneration) shall be represented as a composite value with the following structure:
  1. **User input** — either a `base` value (set directly by the user, always ≥ 1) or a `pd` investment (Development Points allocated by the user, ≥ 0). Purely derived attributes have neither.
  2. **Base modifiers** — an array of permanent bonuses or penalties. Each entry carries a numeric value (positive or negative), a source identifier, and an optional human-readable descriptor. These modifiers are counted when evaluating attribute requirements.
  3. **Temporary modifiers** — an array of transient bonuses or penalties. Same structure as base modifiers. These are excluded when evaluating attribute requirements.
  4. **Computed results** (engine-managed, read-only for the user):
     - `__base_calculada` — the value derived by the engine from the user input via the applicable formula (e.g. PD-to-value conversion table, or characteristic formula). For `base`-type attributes this equals `base` directly.
     - `__final_base` — `__base_calculada + sum(base_modifiers)`. Used for requirement evaluation.
     - `__final_temporal` — `__final_base + sum(temporary_modifiers)`. The value displayed in the UI under normal conditions.
- **[MUST]** Modifiers may be automatic (computed and managed by the rules engine based on other sheet values) or manual (explicitly created, edited, and deleted by the player). Automatic modifiers shall be read-only from the user's perspective.
- **[MUST]** The UI shall display `__final_temporal` as the effective value of any attribute. When `__final_temporal` differs from `__final_base`, the value shall be visually highlighted to indicate that temporary modifiers are active.
- **[MUST]** The UI shall provide a detail view (e.g. tooltip or expandable panel) for any attribute, showing the full breakdown: user input, `__base_calculada`, `__final_base`, `__final_temporal`, and the list of all modifiers with their source, value, and descriptor. Automatic modifiers are shown as read-only; manual modifiers include edit and delete controls.
- **[SHOULD]** When a character file is opened, the engine shall recompute all derived values from scratch and compare them against the computed values persisted in the file (`__base_calculada`, `__final_base`, `__final_temporal`, and automatic modifiers). If any discrepancy is detected, the application shall display a per-attribute warning listing which values changed and by how much. Discrepancies are non-blocking — the engine's freshly computed values always take precedence. Typical causes include engine updates, catalog changes between sessions, or manual edits to the `.acx` file with a text editor.
- **[WON'T]** Computation formulas shall not be exposed for modification via external files in this version. This capability will be evaluated in a future iteration once an adequate validation mechanism is defined.

### 4.4 Input Validation

- **[MUST]** Numeric fields shall reject non-numeric characters at input time.
- **[MUST]** Fields with predefined and bounded values (Race, Class, etc.) shall be implemented as dropdown lists, not free-text fields.
- **[SHOULD]** Numeric fields shall display visual feedback if the entered value exceeds the limits defined by the rules.

---

## 5. Extensibility & Custom Content Support

- **[MUST]** Game content catalogs (weapons, spells, Ki techniques, secondary abilities, categories, etc.) shall reside in TypeScript data modules bundled with the application, completely separate from engine logic.
- **[MUST]** The application shall load base catalogs on startup, representing the official *Anima: Beyond Fantasy* content.
- **[MUST]** The catalog format shall be documented sufficiently for an external contributor to add new entries (e.g. a homebrew weapon, a custom category) without modifying engine or UI code.
- **[MUST]** The application shall support three catalog layers with the following precedence (highest wins on key collision):
  1. **`catalogo_local`** — embedded in the `.acx` file; applies only to that character. Intended for character-specific content (bespoke weapons, custom ki techniques). Loaded when the character is opened.
  2. **Persistent custom catalogs** — loaded from a default directory at startup. Intended for campaign-level content shared across characters (homebrew categories, custom magic vias). Path may be overridden via Settings.
  3. **Base catalogs** — bundled with the application as TypeScript modules. Always present; cannot be removed.
- **[SHOULD]** The user shall be able to specify a custom content directory. Files in that directory shall extend or override individual entries in the base catalogs by identifier.
- **[SHOULD]** The application shall validate custom content files against the defined catalog schema upon loading, reporting descriptive errors if an entry is malformed.
- **[COULD]** The application shall offer a basic visual interface to browse loaded content (base and custom), create new catalog entries, and detect identifier conflicts.
- **[WON'T]** This version shall not expose modification of the computation engine formulas (e.g. Initiative calculation or derivation tables) via external files. This capability will be evaluated in future iterations once an adequate validation mechanism is defined.

---

## 6. Export & Output

- **[MUST]** The application shall provide a print view mode that formats the sheet as a traditional, paper-optimized character sheet.
- **[MUST]** The application shall allow exporting the sheet to a PDF file.
- **[SHOULD]** The exported PDF shall be visually faithful to the print view.
- **[COULD]** The user shall be able to choose between different visual templates for PDF export.

---

## 7. Non-Functional Requirements

### 7.1 Performance

- **[SHOULD]** Recalculation of derived values following an input change shall complete in under 100 ms, so that the user perceives it as instantaneous.
- **[SHOULD]** The application shall start and be ready to use in under 3 seconds on mid-range hardware.
- **[SHOULD]** Loading a character file (including schema validation) shall complete in under 1 second.

### 7.2 Reliability

- **[MUST]** A malformed or corrupted character file shall not cause the application to crash; a descriptive error message shall be displayed and the application shall remain usable.
- **[SHOULD]** The application shall generate automatic backups of the last saved state before overwriting a file.

### 7.3 Usability

- **[MUST]** The interface shall be available in English and Spanish as a minimum.
- **[SHOULD]** The interface shall follow standard desktop conventions (keyboard shortcuts Ctrl+S, Ctrl+O, Ctrl+Z, etc.).
- **[COULD]** The application shall offer a dark mode.

### 7.4 Maintainability

- **[MUST]** The source code shall be hosted in a public repository under an open-source license.
- **[MUST]** The character data schema shall be versioned, and the application shall clearly indicate which schema version it supports.
- **[SHOULD]** The project shall include sufficient documentation for an external contributor to set up the development environment and run the application.

### 7.5 Security

- **[SHOULD]** External rules files shall be loaded in a restricted execution context that does not allow access to the file system or network, to mitigate the risk of malicious mods.
- **[COULD]** The application shall offer the option to verify the integrity of rules files via a hash before loading them.

---

## 8. Constraints & Design Decisions

- The character storage format must be manually readable and editable with any text editor, without additional tooling.
- The application shall not require an internet connection for its primary functionality.
- The application shall have no server component nor dependency on external services in its base architecture.
