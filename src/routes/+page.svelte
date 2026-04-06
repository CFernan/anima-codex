<script lang="ts">
  // import { onMount } from "svelte";
  // import { listen } from "@tauri-apps/api/event";
  // import { invoke } from "@tauri-apps/api/core";

  // let openedFiles = $state<string[]>([]);

  /** POC */
  // -----------------------------------------------------------
  import { caracteristicasStore, sumaBases } from "$lib/stores/characteristics";
  import { CaracteristicaEnum } from "$lib/schema/common/enums";
  import Caracteristica from '$lib/components/Caracteristica.svelte';

  const keys = CaracteristicaEnum.options;

  // -----------------------------------------------------------

  // onMount(async () => {
  //   // Check if a file was passed as CLI argument on startup
  //   const cliFile = await invoke<string | null>("get_cli_file");
  //   if (cliFile) {
  //     openedFiles = [cliFile];
  //   }

  //   // Listen for files opened while the app is already running
  //   await listen<string>("open-file", (event) => {
  //     openedFiles = [...openedFiles, event.payload];
  //   });
  // });
</script>

<main>
  <!-- <section class="files-section">
    {#if openedFiles.length === 0}
      <p>No file open. Double-click an .acx file to open it.</p>
    {:else}
      {#each openedFiles as file}
        <p>Opening file: <code>{file}</code></p>
      {/each}
    {/if}
  </section> -->

  <table class="character-table">
    <thead>
      <tr>
        <th></th>
        <th>Base ({$sumaBases})</th>
        <th>Mod</th>
        <th>Final</th>
        <th>Bono</th>
      </tr>
    </thead>
    <tbody>
      {#each keys as key}
        <Caracteristica name={key} attr={caracteristicasStore[key]} />
      {/each}
    </tbody>
  </table>
</main>
