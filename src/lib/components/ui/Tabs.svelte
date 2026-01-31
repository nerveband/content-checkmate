<script lang="ts">
  interface Tab {
    id: string;
    label: string;
    icon?: string;
  }

  interface Props {
    tabs: Tab[];
    activeTab: string;
    onchange?: (tabId: string) => void;
    class?: string;
  }

  let { tabs, activeTab = $bindable(), onchange, class: className = '' }: Props = $props();

  function handleTabClick(tabId: string) {
    activeTab = tabId;
    onchange?.(tabId);
  }
</script>

<div class="flex border-b border-gray-200 overflow-x-auto scrollbar-none {className}">
  {#each tabs as tab}
    <button
      type="button"
      onclick={() => handleTabClick(tab.id)}
      class="relative px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap {activeTab === tab.id ? 'text-accent' : 'text-gray-600 hover:text-gray-900'}"
    >
      <span class="flex items-center gap-2">
        {#if tab.icon}
          <span class="text-lg">{tab.icon}</span>
        {/if}
        {tab.label}
      </span>
      {#if activeTab === tab.id}
        <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-scale-in"></span>
      {/if}
    </button>
  {/each}
</div>
