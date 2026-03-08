<script lang="ts">
  import { onMount } from "svelte";
  import { listen } from "@tauri-apps/api/event";

  let openedFiles = $state<string[]>([]);

  onMount(async () => {
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