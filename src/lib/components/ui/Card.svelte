<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: Snippet;
  }

  let { class: className = '', hover = true, padding = 'md', children }: Props = $props();

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6'
  };
</script>

<div
  class="bg-white rounded-xl border border-gray-200 shadow-card transition-all duration-200 {hover ? 'hover:shadow-elevated hover:border-gray-300' : ''} {paddingClasses[padding]} {className}"
>
  {@render children()}
</div>
