<script lang="ts">
  import { activeErrors, putDiagnostic } from '$lib/stores/diagnostics';
  import { fly } from 'svelte/transition';

  /**
   * To close the error, we retrieve the internal Writable for the specific key.
   * This triggers the 'bridge' subscription, notifying the global orchestrator.
   */
  function closeError(id: string) {
    // Clear the error while preserving (or clearing) warnings as needed
    putDiagnostic(id, { error: null, warnings: null });
  }
</script>

{#if $activeErrors.length > 0}
  <div class="error-overlay">
    {#each $activeErrors as err (err.id)}
      <div class="error-card" transition:fly={{ y: 20, duration: 300 }}>
        <div class="error-header">
          <strong>Error: {err.id}</strong>
          <button class="close-btn" onclick={() => closeError(err.id)} aria-label="Close">
            &times;
          </button>
        </div>
        <div class="error-body">
          {err.message}
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .error-overlay {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  }

  .error-card {
    pointer-events: auto;
    background: white;
    border-left: 5px solid #dc2626;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    width: 350px;
    overflow: hidden;
    border: 1px solid #fee2e2;
  }

  .error-header {
    background: #fef2f2;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #fee2e2;
    color: #991b1b;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    line-height: 1;
    color: #ef4444;
    cursor: pointer;
    padding: 0 4px;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #7f1d1d;
  }

  .error-body {
    padding: 14px;
    font-size: 0.9rem;
    color: #374151;
    line-height: 1.5;
    background: white;
  }
</style>
