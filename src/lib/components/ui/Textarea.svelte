<script lang="ts">
  interface Props {
    value?: string;
    placeholder?: string;
    label?: string;
    error?: string;
    rows?: number;
    disabled?: boolean;
    class?: string;
    id?: string;
    oninput?: (e: Event) => void;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    label = '',
    error = '',
    rows = 3,
    disabled = false,
    class: className = '',
    id = `textarea-${Math.random().toString(36).slice(2, 9)}`,
    oninput
  }: Props = $props();
</script>

<div class="w-full {className}">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
  {/if}
  <textarea
    {id}
    bind:value
    {placeholder}
    {rows}
    {disabled}
    {oninput}
    class="w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:ring-2 focus:ring-accent/20 focus:border-accent hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none {error ? 'border-negative' : 'border-gray-300'}"
  ></textarea>
  {#if error}
    <p class="mt-1 text-sm text-negative">{error}</p>
  {/if}
</div>
