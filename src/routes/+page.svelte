<script lang="ts">
  import { onMount } from "svelte";
  import { listen } from "@tauri-apps/api/event";
  import { invoke } from "@tauri-apps/api/core";

  let openedFiles = $state<string[]>([]);

  onMount(async () => {
    // Check if a file was passed as CLI argument on startup
    const cliFile = await invoke<string | null>("get_cli_file");
    if (cliFile) {
      openedFiles = [cliFile];
    }

    // Listen for files opened while the app is already running
    await listen<string>("open-file", (event) => {
      openedFiles = [...openedFiles, event.payload];
    });
  });
</script>

<main>
  {#if openedFiles.length === 0}
    <p>No file open. Double-click an .acx file to open it.</p>
  {:else}
    {#each openedFiles as file}
      <p>Opening file: {file}</p>
    {/each}
  {/if}
</main>