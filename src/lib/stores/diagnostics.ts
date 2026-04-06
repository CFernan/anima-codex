import { errorToString, type EngineError, type EngineWarnings } from '$lib/engine';
import { derived, get, readonly, writable, type Readable, type Writable } from 'svelte/store';

export type DiagnosticState = {
  error: EngineError;
  warnings: EngineWarnings;
};

type Key = string | number | symbol;

/**
 * Internal private writable store.
 * Holds the actual Writable instances to allow internal mutations.
 */
const _wdiagnostics: Writable<Record<Key, Writable<DiagnosticState>>> = writable({});

/**
 * Publicly exported Readable store.
 * It transforms the internal Record of Writables into a Record of Readables.
 */
export const diagnostics: Readable<Record<Key, Readable<DiagnosticState>>> = derived(
  _wdiagnostics,
  ($diags) => {
    const readonlyDiag: Record<Key, Readable<DiagnosticState>> = {};

    for (const key in $diags) {
      // Cast each internal Writable to a Readable for the public API
      readonlyDiag[key] = readonly($diags[key]);
    }

    return readonlyDiag;
  }
);

/**
 * Upserts a diagnostic substore for a specific key.
 * * If the key is new, it creates a Writable and "links" it to the root store.
 * This link ensures that any internal change to the substore's state
 * (e.g., adding a warning) triggers a notification in the global store.
 * * @param key - Unique identifier for the diagnostic entry.
 * @param state - The new DiagnosticState to apply.
 */
export function putDiagnostic(key: Key, state: DiagnosticState) {
  const stores = get(_wdiagnostics);

  if (!stores[key]) {
    const newStore = writable(state);
    _wdiagnostics.update(d => ({ ...d, [key]: newStore }));
  } else {
    stores[key].set(state);
    // Always notify global store
    _wdiagnostics.update(d => ({ ...d }));
  }
}

/**
 * Retrieves a direct reference to a specific entity's diagnostic store.
 * Useful for individual components (e.g., an Attribute Input) to show local diagnostic.
 * * @param key - Unique identifier for the entity.
 * @returns Readable<DiagnosticState>
 */
export function getDiagnostic(key: Key): Readable<DiagnosticState> {
  const stores = get(_wdiagnostics);

  if (!stores[key]) {
    // Create silently the store to not trigger updates
    stores[key] = writable<DiagnosticState>({ error: null, warnings: null });
  }

  return readonly(stores[key]);
}

/**
 * Returns a derived boolean store indicating if a specific entry has warnings.
 * Highly efficient for UI toggles and alert icons.
 * * @param key - Entity identifier.
 * @returns Readable<boolean>
 */
export function diagnosticHasWarnings(key: Key): Readable<boolean> {
  const subStore = getDiagnostic(key);

  return derived(subStore, ($state) => {
    return !!$state.warnings && $state.warnings.length > 0;
  });
}


/**
 * Purges the entire diagnostic registry.
 */
export function clearDiagnostics(): void {
  _wdiagnostics.set({});
}

/**
 * Interface for the processed error object used by the UI.
 */
export interface ActiveError {
  id: string;
  message: string;
}

/**
 * A derived store that automatically computes the list of active errors.
 * It reactively tracks the parent 'diagnostics' record AND every
 * individual substore thanks to the internal subscription bridge.
 */
export const activeErrors: Readable<ActiveError[]> = derived(
  diagnostics,
  ($diags, set) => {
    // We map over the stores and subscribe to their values.
    // Note: In a standard Svelte 'derived', we use get() or manual subscriptions
    // because the $ prefix only works inside .svelte files.

    const entries = Object.entries($diags);
    const results: ActiveError[] = [];

    entries.forEach(([key, substore]) => {
      // Manual subscription to the inner store to capture its current state
      const unsubscribe = substore.subscribe((state) => {
        if (state.error !== null && state.error !== undefined) {
          results.push({
            id: key,
            message: errorToString(state.error)
          });
        }
      });
      unsubscribe(); // Immediate unsubscribe after getting the value
    });

    set(results);
  }
);
