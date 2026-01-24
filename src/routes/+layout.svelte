<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="min-h-screen flex flex-col bg-surface-primary">
  <Header />

  <main class="flex-1">
    {@render children()}
  </main>

  <Footer />
</div>
