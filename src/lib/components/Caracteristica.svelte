<script lang="ts">
  import { warningToString } from "$lib/engine";
  import { BaseOrTemporal } from "$lib/engine/common/enum";
  import type { ModificadorAtributoInput } from "$lib/schema/common/basic_types";
  import { setBase, updateCaracteristicaModifier } from "$lib/stores/characteristics";
  import { diagnosticHasWarnings, getDiagnostic } from "$lib/stores/diagnostics";

  let { name, attr } = $props();

  let diag = $derived(getDiagnostic(name));
  let hasWarnings = $derived(diagnosticHasWarnings(name));

  let showModManager = $state(false);
  let newMod = $state<ModificadorAtributoInput & { tipo: BaseOrTemporal }>({
    fuente: "",
    valor: 0,
    descripcion: "",
    tipo: BaseOrTemporal.BASE,
  });

  function handleAddMod(e: SubmitEvent) {
    e.preventDefault(); // Evita que la página se recargue
    if (!newMod.fuente) return;

    updateCaracteristicaModifier(name, newMod.tipo, undefined, {
      fuente: newMod.fuente,
      valor: newMod.valor,
      descripcion: newMod.descripcion,
      __automatico: false,
    });

    showModManager = false;
    newMod.fuente = "";
    newMod.valor = 0;
    newMod.descripcion = "";
  }

  function handleUpdateMod(
    tipo: BaseOrTemporal,
    modOriginal: any,
    campo: string,
    valor: any,
  ) {
    const modActualizado: ModificadorAtributoInput = {
      ...modOriginal,
      [campo]: valor,
    };

    updateCaracteristicaModifier(name, tipo, modOriginal, modActualizado);
  }

  function handleRemoveMod(tipo: BaseOrTemporal, mod: any) {
    updateCaracteristicaModifier(name, tipo, mod, undefined);
  }
</script>

<tr>
  <td class="capitalize font-bold">{name}</td>

  <td class="input-cell">
    <div class="input-relative-wrapper">
      <input
        type="number"
        value={$attr.base}
        class:input-warning={$hasWarnings}
        oninput={(e) => setBase(name, e.currentTarget.value)}
      />

      {#if $hasWarnings}
        <div class="warning-indicator">
          <span class="warning-icon">⚠️</span>
          <div class="tooltip">
            {#each $diag.warnings! as w}
              <p>{warningToString(w)}</p>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </td>

  <td class="text-center">
    <button
      class="btn-manage"
      onclick={() => (showModManager = !showModManager)}
    >
      {showModManager ? "Cerrar" : "⚙️ Modificadores"}
    </button>
  </td>

  <td class="output">
    {$attr.__final_base ?? 0}
  </td>

  <td class="output bonus">
    {$attr._bono_base >= 0 ? "+" : ""}{$attr._bono_base}
  </td>
</tr>

{#if showModManager}
  <tr class="manager-row">
    <td colspan="5">
      <div class="manager-panel">
        <div class="mods-list">
          {#each [BaseOrTemporal.BASE, BaseOrTemporal.TEMPORAL] as t}
            {@const mods =
              t === BaseOrTemporal.BASE
                ? $attr.modificadores_base || []
                : $attr.modificadores_temporales || []}
            {#each mods as mod}
              <div class="mod-item" class:is-auto={mod.__automatico}>
                <span class="badge"
                  >{t === BaseOrTemporal.BASE ? "B" : "T"}</span
                >

                {#if mod.__automatico}
                  <span class="source-ro">[{mod.fuente}]</span>
                  <span class="value-ro">{mod.valor}</span>
                  <span class="desc-ro">{mod.descripcion || ""}</span>
                  <span class="lock">🔒</span>
                {:else}
                  <input
                    type="text"
                    value={mod.fuente}
                    onchange={(e) =>
                      handleUpdateMod(t, mod, "fuente", e.currentTarget.value)}
                    class="input-source"
                  />
                  <input
                    type="number"
                    value={mod.valor}
                    onchange={(e) =>
                      handleUpdateMod(
                        t,
                        mod,
                        "valor",
                        Number(e.currentTarget.value),
                      )}
                    class="input-value"
                  />
                  <input
                    type="text"
                    value={mod.descripcion || ""}
                    placeholder="Nota..."
                    onchange={(e) =>
                      handleUpdateMod(
                        t,
                        mod,
                        "descripcion",
                        e.currentTarget.value,
                      )}
                    class="input-desc"
                  />

                  <button
                    class="btn-del"
                    onclick={() => handleRemoveMod(t, mod)}
                  >
                    🗑️
                  </button>
                {/if}
              </div>
            {/each}
          {/each}
        </div>

        <form onsubmit={handleAddMod} class="add-mod-form">
          <select bind:value={newMod.tipo}>
            <option value={BaseOrTemporal.BASE}>BASE</option>
            <option value={BaseOrTemporal.TEMPORAL}>TEMP</option>
          </select>
          <input bind:value={newMod.fuente} placeholder="Fuente..." required />
          <input type="number" bind:value={newMod.valor} class="w-16" />
          <button type="submit" class="btn-confirm">Añadir</button>
        </form>
      </div>
    </td>
  </tr>
{/if}

<style>
  /* Contenedor para posicionar el icono y el tooltip */
  .input-relative-wrapper {
    display: flex;
    align-items: center;
    position: relative;
    gap: 4px;
  }

  .warning-indicator {
    position: relative;
    cursor: help;
    display: flex;
    align-items: center;
  }

  .warning-icon {
    font-size: 1.1rem;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.1));
  }

  /* Estilos del Tooltip (Aparece al pasar el ratón por el icono) */
  .tooltip {
    visibility: hidden;
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #2d3748; /* Slate 800 */
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.8rem;
    white-space: nowrap;
    z-index: 50;
    opacity: 0;
    transition: opacity 0.2s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .warning-indicator:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }

  /* Triángulo del tooltip */
  .tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #2d3748 transparent transparent transparent;
  }

  /* Estados visuales del Input */
  .input-warning {
    border: 1px solid #d97706 !important; /* Amber 600 */
    background-color: #fffbeb !important;
  }

  .output {
    font-family: monospace;
    font-weight: bold;
    text-align: center;
  }

  .bonus {
    color: #2c7a7b;
  }

  .btn-confirm {
    background: #10b981;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .output {
    text-align: center;
    font-family: monospace;
  }
  .bonus {
    color: #059669;
    font-weight: bold;
  }

  .manager-panel {
    background: #f1f5f9;
    padding: 1rem;
    border-bottom: 2px solid #cbd5e0;
  }
  .mod-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    background: white;
    padding: 4px;
    border-radius: 4px;
    margin-bottom: 4px;
    border: 1px solid #e2e8f0;
  }
  .mod-item.is-auto {
    background: #e2e8f0;
    color: #64748b;
    border-style: dashed;
  }

  .badge {
    font-size: 0.6rem;
    font-weight: bold;
    padding: 2px 4px;
    background: #94a3b8;
    color: white;
    border-radius: 3px;
  }
  .input-source {
    font-weight: bold;
    width: 120px;
  }
  .input-value {
    width: 50px;
    text-align: center;
  }
  .input-desc {
    flex-grow: 1;
    font-size: 0.8rem;
    color: #475569;
    border-bottom: 1px solid transparent;
  }
  .input-desc:focus {
    border-bottom-color: #3b82f6;
    outline: none;
  }

  .btn-del {
    color: #ef4444;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 5px;
  }
  .add-mod-form {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    border-top: 1px solid #cbd5e0;
    /* pt: 0.5rem; */
  }
</style>
