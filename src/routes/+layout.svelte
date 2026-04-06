<script>
  import '../styles/style.css';
  import ErrorPopup from '$lib/components/ErrorPopup.svelte';
  let { children } = $props();
</script>

<ErrorPopup />

{@render children()}