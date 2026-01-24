<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    onclick?: () => void;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    class: className = '',
    onclick,
    children
  }: Props = $props();

  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent-dark active:scale-[0.98] shadow-subtle',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-negative text-white hover:bg-negative-dark',
    success: 'bg-positive text-white hover:bg-positive-dark'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  onclick={onclick}
  class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed {variantClasses[variant]} {sizeClasses[size]} {className}"
>
  {#if loading}
    <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
  {/if}
  {@render children()}
</button>
