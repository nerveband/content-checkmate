<script lang="ts">
  interface Props {
    checked?: boolean;
    label?: string;
    disabled?: boolean;
    class?: string;
    onchange?: (checked: boolean) => void;
  }

  let { checked = $bindable(false), label = '', disabled = false, class: className = '', onchange }: Props = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

<label class="inline-flex items-center gap-3 cursor-pointer select-none {disabled ? 'opacity-50 cursor-not-allowed' : ''} {className}">
  <div class="relative">
    <input
      type="checkbox"
      checked={checked}
      {disabled}
      onchange={handleChange}
      class="sr-only peer"
    />
    <div class="w-5 h-5 border-2 rounded border-gray-300 bg-white peer-checked:bg-accent peer-checked:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/20 peer-focus-visible:ring-offset-2 transition-all duration-200"></div>
    <svg
      class="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
    </svg>
  </div>
  {#if label}
    <span class="text-sm text-gray-700">{label}</span>
  {/if}
</label>
