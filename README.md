# Anima Codex

An open-source desktop character sheet for *Anima: Beyond Fantasy*.  
Built with Tauri + SvelteKit + TypeScript.

---

## Prerequisites

Before running the project, ensure you have the following installed:

| Tool | Version | Link |
|---|---|---|
| Rust & Cargo | 1.94+ | https://rustup.rs |
| Node.js | 24+ | https://nodejs.org |
| npm | 11+ | Included with Node.js |

On Windows, also ensure you have:
- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) — select "Desktop development with C++"
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) — pre-installed on Windows 11

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/CFernan/anima-codex.git
cd anima-codex
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run in development mode
```bash
npm run tauri dev
```

The first build will take several minutes as Cargo downloads and compiles
Rust dependencies. Subsequent builds will be significantly faster.

---

## Building for Production

To produce a release executable for your current platform:
```bash
npm run tauri build
```

The output artifacts will be located in `src-tauri/target/release/bundle/`:

| Platform | Artifact |
|---|---|
| Windows (NSIS) | `nsis/anima-codex_0.1.0_x64-setup.exe` |

> **Note:** Linux and macOS builds will be added when the CI/CD pipeline is configured (US-32).

---

## Project Structure
```
anima-codex/
├── docs/                   # Project documentation
│   ├── requirements.md
│   ├── architecture.md
│   ├── tasking.md
│   └── pseudo_schema_acx.md  # Normative .acx file format reference
├── examples/               # .acx example files
├── src/                    # Frontend (SvelteKit + TypeScript)
│   ├── lib/
│   │   ├── engine/         # Rules engine — no UI dependencies
│   │   ├── schema/         # Zod schemas and inferred types
│   │   │   ├── common/     # Primitives shared by acx & catalog
│   │   │   ├── acx/        # Character file (.acx) schemas
│   │   │   └── catalog/    # Catalog validation contracts (base & custom)
│   │   ├── data/           # Default official content (satisfies catalog schemas)
│   │   ├── stores/         # Svelte reactive stores
│   │   └── i18n/           # Localisation files
│   ├── components/         # (pending — US-16 onwards)
│   │   ├── sheet/          # Character sheet sections
│   │   ├── shared/         # Reusable UI primitives
│   │   └── layout/         # App layout components
│   ├── routes/             # SvelteKit file-based routing
│   └── app.html            # HTML root template
├── src-tauri/              # Desktop wrapper (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── capabilities/       # Tauri permission declarations
│   ├── icons/              # Application icons
│   └── tauri.conf.json
├── tests/                  # Unit tests (Vitest)
│   └── lib/
│       ├── schema/         # Schema validation tests
│       └── data/           # Default catalog integrity tests
├── tools/                  # (pending — backlog) Standalone utilities
│   └── xlsx-migrator/
└── static/                 # Static assets
```

---

## Documentation

- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [.acx File Format](docs/pseudo_schema_acx.md)

---

## License

This project is open-source. License TBD.