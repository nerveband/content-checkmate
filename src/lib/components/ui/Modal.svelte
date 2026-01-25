<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade, scale } from 'svelte/transition';

  interface Props {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onclose?: () => void;
    children: Snippet;
    footer?: Snippet;
  }

  let { open = $bindable(false), title = '', size = 'md', onclose, children, footer }: Props = $props();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  function handleBackdropClick() {
    open = false;
    onclose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      open = false;
      onclose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
    transition:fade={{ duration: 200 }}
    onclick={handleBackdropClick}
    role="presentation"
  ></div>

  <!-- Modal -->
  <div
    class="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-2xl shadow-elevated z-50 max-h-[90vh] overflow-hidden flex flex-col {sizeClasses[size]} w-full"
    transition:scale={{ duration: 200, start: 0.95 }}
    role="dialog"
    aria-modal="true"
    onclick={(e) => e.stopPropagation()}
  >
    {#if title}
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="font-display text-xl text-gray-900">{title}</h2>
        <button
          type="button"
          onclick={() => { open = false; onclose?.(); }}
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/if}

    <div class="flex-1 overflow-auto p-6">
      {@render children()}
    </div>

    {#if footer}
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        {@render footer()}
      </div>
    {/if}
  </div>
{/if}
