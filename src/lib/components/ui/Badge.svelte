<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'high' | 'medium' | 'low' | 'compliant' | 'default';
    size?: 'sm' | 'md';
    class?: string;
    children: Snippet;
  }

  let { variant = 'default', size = 'md', class: className = '', children }: Props = $props();

  const variantClasses = {
    high: 'bg-negative-light text-negative-dark',
    medium: 'bg-warning-light text-amber-700',
    low: 'bg-blue-100 text-blue-700',
    compliant: 'bg-positive-light text-positive-dark',
    default: 'bg-gray-100 text-gray-700'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs'
  };
</script>

<span
  class="inline-flex items-center gap-1 rounded-full font-medium {variantClasses[variant]} {sizeClasses[size]} {className}"
>
  {@render children()}
</span>
